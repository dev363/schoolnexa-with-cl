import React from 'react';
import { Card as BSCard, type CardProps } from 'react-bootstrap';
import { useTheme } from '@/context/ThemeContext';

export interface TCardProps extends CardProps {
  children?: React.ReactNode;
}

interface ThemeCardComponent extends React.FC<TCardProps> {
  Header: typeof BSCard.Header;
  Body: typeof BSCard.Body;
  Footer: typeof BSCard.Footer;
  Title: typeof BSCard.Title;
  Subtitle: typeof BSCard.Subtitle;
  Text: typeof BSCard.Text;
  Img: typeof BSCard.Img;
  Link: typeof BSCard.Link;
}

export const ThemeCard: ThemeCardComponent = ({
  children,
  className = '',
  bg,
  text,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <BSCard
      bg={bg ?? (isDark ? 'dark' : 'white')}
      text={text ?? (isDark ? 'white' : 'dark')}
      className={`border shadow-sm ${className}`.trim()}
      {...props}
    >
      {children}
    </BSCard>
  );
};

ThemeCard.Header = BSCard.Header;
ThemeCard.Body = BSCard.Body;
ThemeCard.Footer = BSCard.Footer;
ThemeCard.Title = BSCard.Title;
ThemeCard.Subtitle = BSCard.Subtitle;
ThemeCard.Text = BSCard.Text;
ThemeCard.Img = BSCard.Img;
ThemeCard.Link = BSCard.Link;

export const Card = ThemeCard;
export default ThemeCard;
