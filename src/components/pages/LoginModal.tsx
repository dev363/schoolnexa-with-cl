import React, { useState } from 'react';
import { Card, Form, Button, Alert, Stack, InputGroup, Container } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DEMO_USERS } from '@/data/auth-seed';
import { LogIn, ShieldAlert, GraduationCap, Mail, Lock, Check } from 'lucide-react';
import LanguageSwitcher from '@/components/PageLayout/components/Header/components/LanguageSwitcher';

export const LoginModal: React.FC = () => {
  const { login, isLoading, authError, clearAuthError } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    email: 'alex.director@schoolnexa.com',
    password: 'password123',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync session revocation / expiration message or external auth error
  React.useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearAuthError();
    const result = await login(form.email, form.password);
    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleQuickSelect = (userEmail: string) => {
    setForm({
      email: userEmail,
      password: 'password123',
    });
    setErrorMessage(null);
    clearAuthError();
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative">
      {/* Top right language selector */}
      <div className="position-absolute top-0 end-0 p-3 z-3">
        <LanguageSwitcher />
      </div>

      <Container style={{ maxWidth: '420px' }}>
        <Card id="login-card" className="shadow-sm border">
          <Card.Body className="p-4">
            {/* Brand Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded bg-primary text-white mb-2"
                style={{ width: '36px', height: '36px' }}
              >
                <GraduationCap size={20} />
              </div>
              <h1 className="h5 fw-bold mb-1">{t.auth.erpPlatform}</h1>
              <p className="text-muted small mb-0">{t.auth.erpPlatformSubtitle}</p>
            </div>

            {errorMessage && (
              <Alert
                id="login-failed-alert"
                variant="danger"
                className="py-2.5 px-3 mb-3 small d-flex align-items-start gap-2.5"
                dismissible
                onClose={() => {
                  setErrorMessage(null);
                  clearAuthError();
                }}
              >
                <ShieldAlert size={18} className="shrink-0 text-danger mt-0.5" />
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-danger">Login Failed</div>
                  <div className="mt-0.5 text-danger-emphasis">{errorMessage}</div>
                </div>
              </Alert>
            )}

            <Form id="login-form" onSubmit={handleSubmit} className="mb-3">
              <Form.Group className="mb-2.5">
                <Form.Label className="small fw-medium mb-1">{t.auth.emailAddress}</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <Mail size={14} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    id="login-email-input"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, email: e.target.value }));
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="name@school.com"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-2.5">
                <Form.Label className="small fw-medium mb-1">{t.auth.password}</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <Lock size={14} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    id="login-password-input"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, password: e.target.value }));
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                  />
                </InputGroup>
              </Form.Group>

              <Button
                id="login-submit-btn"
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
                className="w-100 d-flex align-items-center justify-content-center gap-2"
              >
                <LogIn size={15} />
                <span>{isLoading ? t.auth.authenticating : t.auth.signInBtn}</span>
              </Button>
            </Form>

            {/* Demo Fast Login Profiles */}
            <div className="pt-3 border-top">
              <div className="text-muted small fw-medium mb-2" style={{ fontSize: '0.75rem' }}>
                {t.auth.demoProfiles}
              </div>
              <Stack gap={1}>
                {DEMO_USERS.map((demo) => {
                  const isSelected = form.email === demo.email;
                  return (
                    <Button
                      key={demo.id}
                      id={`demo-user-btn-${demo.id}`}
                      type="button"
                      variant={isSelected ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleQuickSelect(demo.email)}
                      className={`text-start d-flex align-items-center justify-content-between py-1.5 px-2.5 ${
                        isSelected ? 'text-white' : 'text-body'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <div className="min-w-0 pe-2">
                        <div className="fw-semibold text-truncate">{demo.fullName}</div>
                        <div
                          className={`text-truncate small ${isSelected ? 'text-white-50' : 'text-muted'}`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {demo.email} •{' '}
                          {demo.isSuperAdmin
                            ? t.common.superAdmin
                            : demo.schoolMemberships[0]?.roleCodes.join(', ')}
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="shrink-0" />}
                    </Button>
                  );
                })}
              </Stack>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};
