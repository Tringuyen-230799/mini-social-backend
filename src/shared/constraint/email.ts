import { EMAIL_TEMPLATE } from './email-template';

export const subjectMap = {
  [EMAIL_TEMPLATE.INVITE_USER]: 'You have been invited to join MORE Cashback Support Tool!',
  [EMAIL_TEMPLATE.SUSPEND_USER]: 'Your MORE Cashback Support Tool account was suspended!',
  [EMAIL_TEMPLATE.RESTORE_USER_ACTIVE]: 'Your MORE Cashback Support Tool account was restored!',
  [EMAIL_TEMPLATE.RESTORE_USER_SUSPEND]: 'Your MORE Cashback Support Tool account was restored!',
  [EMAIL_TEMPLATE.DELETE_USER]: 'Your MORE Cashback Support Tool account was deleted!',
  [EMAIL_TEMPLATE.SUSPEND_USER_ORGANIZATION]: 'Your partner has been suspended!',
};
