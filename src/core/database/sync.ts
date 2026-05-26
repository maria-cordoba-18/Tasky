import { Q } from '@nozbe/watermelondb';
import { database } from './database';
import Task from './models/Task';

interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export const syncTasks = async (userEmail: string): Promise<void> => {
  try {
    const taskCollection = database.get<Task>('tasks');

    // Solo sync si este usuario no tiene tareas aún
    const existingUserTasks = await taskCollection
      .query(Q.where('user_id', userEmail))
      .fetch();

    if (existingUserTasks.length > 0) return;

    const response = await fetch('https://dummyjson.com/todos');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    const serverTodos: ApiTodo[] = data.todos;

    await database.write(async () => {
      const tasksToCreate = serverTodos.map((todo) =>
        taskCollection.prepareCreate((task: any) => {
          task._setRaw('title', todo.todo);
          task._setRaw('completed', todo.completed);
          task._setRaw('server_id', todo.id);
          task._setRaw('created_at', Date.now());
          task._setRaw('user_id', userEmail);
        })
      );
      await database.batch(...tasksToCreate);
    });
  } catch (error) {
    console.error('Error syncing tasks:', error);
  }
};