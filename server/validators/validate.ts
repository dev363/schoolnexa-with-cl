import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError, AppErrorDetails } from '../middleware/errorHandler';

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'uuid';

export interface ValidationRule {
  required?: boolean;
  type?: FieldType;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: readonly any[];
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export type SchemaDefinition = Record<string, ValidationRule>;

export interface RequestValidationSchema {
  body?: SchemaDefinition;
  query?: SchemaDefinition;
  params?: SchemaDefinition;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateField(
  fieldName: string,
  value: any,
  rule: ValidationRule,
  location: string,
): AppErrorDetails | null {
  const isPresent = value !== undefined && value !== null && value !== '';

  if (rule.required && !isPresent) {
    return {
      field: fieldName,
      message: rule.message || `${fieldName} is required in ${location}`,
      code: 'REQUIRED_FIELD_MISSING',
    };
  }

  if (!isPresent) {
    return null; // optional and missing
  }

  // Type checks
  if (rule.type) {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be a string`,
            code: 'INVALID_TYPE',
          };
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be a valid number`,
            code: 'INVALID_TYPE',
          };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be a boolean`,
            code: 'INVALID_TYPE',
          };
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be an array`,
            code: 'INVALID_TYPE',
          };
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be an object`,
            code: 'INVALID_TYPE',
          };
        }
        break;
      case 'email':
        if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be a valid email address`,
            code: 'INVALID_EMAIL',
          };
        }
        break;
      case 'uuid':
        if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
          return {
            field: fieldName,
            message: rule.message || `${fieldName} must be a valid UUID`,
            code: 'INVALID_UUID',
          };
        }
        break;
    }
  }

  // String bounds
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be at least ${rule.minLength} characters`,
        code: 'MIN_LENGTH',
      };
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} cannot exceed ${rule.maxLength} characters`,
        code: 'MAX_LENGTH',
      };
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} format is invalid`,
        code: 'PATTERN_MISMATCH',
      };
    }
  }

  // Number bounds
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be at least ${rule.min}`,
        code: 'MIN_VALUE',
      };
    }
    if (rule.max !== undefined && value > rule.max) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} cannot exceed ${rule.max}`,
        code: 'MAX_VALUE',
      };
    }
  }

  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    return {
      field: fieldName,
      message: rule.message || `${fieldName} must be one of: ${rule.enum.join(', ')}`,
      code: 'INVALID_ENUM_VALUE',
    };
  }

  // Custom function
  if (rule.custom) {
    const customRes = rule.custom(value);
    if (customRes === false || typeof customRes === 'string') {
      return {
        field: fieldName,
        message:
          typeof customRes === 'string'
            ? customRes
            : rule.message || `${fieldName} failed custom validation`,
        code: 'CUSTOM_VALIDATION_FAILED',
      };
    }
  }

  return null;
}

/**
 * Reusable request validation middleware.
 * Validates request body, query parameters, and route parameters against declarative schemas.
 *
 * Example:
 * router.post('/users', validate({ body: { email: { required: true, type: 'email' } } }), controller.create);
 */
export function validate(schema: RequestValidationSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: AppErrorDetails[] = [];

    if (schema.params) {
      for (const [field, rule] of Object.entries(schema.params)) {
        const err = validateField(field, req.params[field], rule, 'route params');
        if (err) errors.push(err);
      }
    }

    if (schema.query) {
      for (const [field, rule] of Object.entries(schema.query)) {
        const err = validateField(field, req.query[field], rule, 'query string');
        if (err) errors.push(err);
      }
    }

    if (schema.body) {
      for (const [field, rule] of Object.entries(schema.body)) {
        const err = validateField(field, req.body?.[field], rule, 'request body');
        if (err) errors.push(err);
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation failed', 400, errors));
    }

    return next();
  };
}

export default validate;
