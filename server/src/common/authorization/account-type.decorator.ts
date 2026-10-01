import { SetMetadata } from '@nestjs/common';
import { AccountType } from '../enums/account-type.enum';

export const ACCOUNT_TYPE_KEY = 'account_type';
export const ALLOW_ANY_STAFF_KEY = 'allow_any_staff';

export const StaffOnly = () => SetMetadata(ACCOUNT_TYPE_KEY, AccountType.STAFF);
export const CustomerOnly = () => SetMetadata(ACCOUNT_TYPE_KEY, AccountType.CUSTOMER);
export const AllowAnyStaff = () => SetMetadata(ALLOW_ANY_STAFF_KEY, true);
