// Implementación usando fetch nativo
const BASE_URL = 'https://dummyjson.com/todos';

export interface RemoteTask {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface FetchTasksResponse {
  todos: RemoteTask[];
  total: number;
  skip: number;
  limit: number;
}

export const fetchRemoteTasks = async (): Promise<RemoteTask[]> => {
  const response = await fetch(`${BASE_URL}?limit=50`);
  if (!response.ok) {
    throw new Error('Error al obtener tareas desde la API');
  }
  const data: FetchTasksResponse = await response.json();
  return data.todos;
};

export const updateRemoteTask = async (id: number, completed: boolean): Promise<RemoteTask> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar tarea en la API');
  }
  return await response.json();
};
