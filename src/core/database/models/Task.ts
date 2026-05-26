import { Model } from '@nozbe/watermelondb';

export default class Task extends Model {
  static table = 'tasks';
  static associations = {};

  get title(): string { return this._getRaw('title') as string; }
  get completed(): boolean { return this._getRaw('completed') as boolean; }
  get serverId(): number { return this._getRaw('server_id') as number; }
  get createdAt(): Date { return new Date(this._getRaw('created_at') as number); }
  get description(): string { return this._getRaw('description') as string; }
  get attachmentUri(): string { return this._getRaw('attachment_uri') as string; }
  get userId(): string { return this._getRaw('user_id') as string; }

  async toggleCompletion() {
    const { database } = require('../database');
    await database.write(async () => {
      await this.update((task: any) => {
        task._setRaw('completed', !this.completed);
      });
    });
  }
}