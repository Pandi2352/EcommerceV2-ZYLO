import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { AUDIT_EVENTS, type AuditLogQuery } from '../../../services/audit.service';
import { humanizeConstant } from '../../../utils/format';
import SelectField from '../../../components/common/SelectField';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';

export type AuditFilters = Pick<AuditLogQuery, 'event' | 'email' | 'portal'>;

const EVENT_OPTIONS = AUDIT_EVENTS.map((event) => ({ value: event, label: humanizeConstant(event) }));
const PORTAL_OPTIONS = [
  { value: 'admin', label: 'Admin portal' },
  { value: 'customer', label: 'Storefront' },
];

export interface AuditLogFiltersProps {
  value: AuditFilters;
  onChange: (filters: AuditFilters) => void;
}

/** Event / portal dropdowns apply immediately; the email search applies on submit. */
export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({ value, onChange }) => {
  const [email, setEmail] = useState(value.email ?? '');

  return (
    <form
      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-3 items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onChange({ ...value, email: email.trim() || undefined });
      }}
    >
      <SelectField
        label="Event"
        placeholder="All events"
        options={EVENT_OPTIONS}
        value={value.event ?? ''}
        onChange={(event) => onChange({ ...value, event: event.target.value || undefined })}
      />
      <SelectField
        label="Portal"
        placeholder="All portals"
        options={PORTAL_OPTIONS}
        value={value.portal ?? ''}
        onChange={(event) => onChange({ ...value, portal: (event.target.value || undefined) as AuditFilters['portal'] })}
      />
      <InputField
        label="Email"
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        clearable
        onClear={() => {
          setEmail('');
          onChange({ ...value, email: undefined });
        }}
      />
      <Button type="submit" variant="outline" leftIcon={<Search className="w-4 h-4" />} className="py-2.5">
        Search
      </Button>
    </form>
  );
};

export default AuditLogFilters;
