import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'tasks',
          columns: [
            { name: 'user_id', type: 'string', isOptional: true, isIndexed: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
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
    },
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'tasks',
          columns: [
            { name: 'description', type: 'string', isOptional: true },
            { name: 'attachment_uri', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});