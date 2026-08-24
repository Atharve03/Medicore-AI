import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

import Button from '../../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Compass className="h-10 w-10 text-clinical-400" />
      <h1 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-sm text-sm text-ink-light/60 dark:text-ink-dark/60">
        The link you followed may be outdated, or the page may have moved.
      </p>
      <Link to="/">
        <Button variant="secondary">Go to your dashboard</Button>
      </Link>
    </div>
  );
}
