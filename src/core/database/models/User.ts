import { Model } from '@nozbe/watermelondb';

export default class User extends Model {
  static table = 'users';
  static associations = {};

  get firstName(): string {
    return this._getRaw('first_name') as string;
  }

  get lastName(): string {
    return this._getRaw('last_name') as string;
  }

  get email(): string {
    return this._getRaw('email') as string;
  }

  get password(): string {
    return this._getRaw('password') as string;
  }

  get createdAt(): number {
    return this._getRaw('created_at') as number;
  }
}
