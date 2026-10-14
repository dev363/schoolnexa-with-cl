import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button } from 'react-bootstrap';
import { Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { APP_NAVIGATION } from '@/data/navigation-data';

export interface PlaceholderViewProps {
  viewId?: string;
  onNavigate?: (viewId: string) => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ viewId, onNavigate }) => {
  const { moduleSlug, viewId: paramViewId } = useParams<{ moduleSlug?: string; viewId?: string }>();
  const navigate = useNavigate();
  const effectiveViewId = viewId || moduleSlug || paramViewId || 'dashboard';

  const handleNavigate = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target === 'dashboard' ? '/' : `/${target}`);
    }
  };

  const { activeSchool, activeAcademicYear } = useAuth();
  const { t } = useLanguage();

  const navItem = APP_NAVIGATION.find((n) => n.id === effectiveViewId);
  const moduleI18n = navItem ? (t.navModules as any)[navItem.labelKey] : null;
  const sectionI18n = navItem ? (t.navSections as any)[navItem.sectionKey] : null;

  const itemLabel = moduleI18n?.label || navItem?.defaultLabel || effectiveViewId;
  const itemDesc = moduleI18n?.desc || navItem?.description || '';
  const itemSection = sectionI18n || navItem?.defaultSection || t.common.system;

  return (
    <Container
      fluid
      className="px-3 px-md-4 py-4 d-flex flex-column gap-4"
      style={{ maxWidth: '1200px' }}
    >
      {/* Header Banner */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <Badge
                bg="primary-subtle"
                text="primary"
                className="mb-2 d-inline-flex align-items-center gap-1"
              >
                <span>{itemSection}</span>
                <span>&bull;</span>
                <span>
                  {t.common.tenant}: {activeSchool?.code}
                </span>
              </Badge>
              <h1 className="h3 fw-bold mb-1">{itemLabel}</h1>
              <p className="text-muted small mb-0" style={{ maxWidth: '640px' }}>
                {itemDesc}
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <div
                className="p-2.5 rounded border bg-body-tertiary text-start"
                style={{ minWidth: '150px' }}
              >
                <div className="text-muted small fw-medium" style={{ fontSize: '0.72rem' }}>
                  {t.modulesView.academicContext}
                </div>
                <div className="fw-bold text-success font-monospace small">
                  {activeAcademicYear?.code} ({activeAcademicYear?.name})
                </div>
              </div>

              <div
                className="p-2.5 rounded border bg-body-tertiary text-start"
                style={{ minWidth: '150px' }}
              >
                <div className="text-muted small fw-medium" style={{ fontSize: '0.72rem' }}>
                  {t.modulesView.authGate}
                </div>
                <div className="fw-bold text-primary font-monospace small">
                  {navItem?.requiredPermission || t.modulesView.publicModule}
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main Module Content / Live State */}
      <Card className="shadow-sm border text-center p-4 p-md-5">
        <Card.Body className="d-flex flex-column align-items-center gap-3">
          <div
            className="rounded-4 bg-primary-subtle text-primary d-flex align-items-center justify-content-center p-3"
            style={{ width: '64px', height: '64px' }}
          >
            <Layers size={32} />
          </div>

          <div className="mx-auto" style={{ maxWidth: '440px' }}>
            <h2 className="h5 fw-bold mb-1">
              {itemLabel} {t.modulesView.moduleInitialized}
            </h2>
            <p className="text-muted small mb-3">{t.modulesView.moduleInitializedDesc}</p>
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
              <code
                className="px-2 py-1 rounded bg-body-tertiary border font-monospace text-primary small"
                style={{ fontSize: '0.75rem' }}
              >
                x-school-id: {activeSchool?.id}
              </code>
              <code
                className="px-2 py-1 rounded bg-body-tertiary border font-monospace text-success small"
                style={{ fontSize: '0.75rem' }}
              >
                x-academic-year-id: {activeAcademicYear?.id}
              </code>
            </div>
          </div>

          {/* Quick Nav shortcut */}
          <div className="d-flex justify-content-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNavigate('dashboard')}
              className="fw-semibold shadow-sm"
            >
              {t.common.returnToDashboard}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => handleNavigate('rbac')}>
              {t.common.reviewPermissions}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlaceholderView;
