import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { UserPlus, TrendingUp, RotateCcw, ArrowLeftRight, Users } from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    newAdmissions: number;
    promoted: number;
    repeated: number;
    transferred: number;
    completed: number;
  };
  activeYear: string;
}

export const AdmissionStatsGrid: React.FC<StatsProps> = ({ stats, activeYear }) => {
  const cards = [
    {
      title: 'New Admissions',
      count: stats.newAdmissions,
      icon: UserPlus,
      color: 'text-primary',
      bgLight: 'bg-primary-subtle',
      subtitle: activeYear === 'ALL' ? 'Across all sessions' : `AY ${activeYear}`,
    },
    {
      title: 'Promoted',
      count: stats.promoted,
      icon: TrendingUp,
      color: 'text-success',
      bgLight: 'bg-success-subtle',
      subtitle: 'From prior academic year',
    },
    {
      title: 'Repeated',
      count: stats.repeated,
      icon: RotateCcw,
      color: 'text-warning',
      bgLight: 'bg-warning-subtle',
      subtitle: 'Retained in class',
    },
    {
      title: 'Transferred',
      count: stats.transferred,
      icon: ArrowLeftRight,
      color: 'text-danger',
      bgLight: 'bg-danger-subtle',
      subtitle: 'Transferred out / TC issued',
    },
    {
      title: 'Total Enrollments',
      count: stats.total,
      icon: Users,
      color: 'text-secondary',
      bgLight: 'bg-secondary-subtle',
      subtitle: 'Active session records',
    },
  ];

  return (
    <Row className="g-2 mb-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Col xs={6} md={4} lg key={idx}>
            <Card className="h-100 border shadow-none bg-body">
              <Card.Body className="p-2 d-flex align-items-center gap-2">
                <div
                  className={`d-flex align-items-center justify-content-center rounded p-2 ${card.bgLight} ${card.color}`}
                  style={{ width: '38px', height: '38px', minWidth: '38px' }}
                >
                  <Icon size={18} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>
                    {card.title}
                  </div>
                  <div className="h5 fw-bold mb-0 lh-1">{card.count}</div>
                  <div className="text-muted small text-truncate" style={{ fontSize: '0.68rem' }}>
                    {card.subtitle}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};
