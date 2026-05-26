import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'attachment_uri', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string', isOptional: true, isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'password', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});