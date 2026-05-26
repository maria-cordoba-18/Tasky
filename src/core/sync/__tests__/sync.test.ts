import { syncTasks } from '../index';
import { fetchRemoteTasks, updateRemoteTask } from '../../api/dummyJson';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';

// Mockeamos la API
jest.mock('../../api/dummyJson', () => ({
  fetchRemoteTasks: jest.fn(),
  updateRemoteTask: jest.fn(),
}));

// Mockeamos WatermelonDB superficialmente para propósitos de la prueba
jest.mock('../../database', () => {
  const mockTasks = [
    {
      id: 'local1',
      remoteId: 1,
      todo: 'Comprar leche',
      completed: false,
      isPendingUpdate: true,
      update: jest.fn(async (cb) => { cb(mockTasks[0]); }),
      prepareUpdate: jest.fn(),
    }
  ];

  return {
    database: {
      collections: {
        get: jest.fn().mockReturnValue({
          query: jest.fn().mockReturnValue({
            fetch: jest.fn().mockResolvedValue(mockTasks)
          }),
          prepareCreate: jest.fn(),
        }),
      },
      write: jest.fn(async (cb) => cb()),
      batch: jest.fn(),
    }
  };
});

describe('Lógica de Sincronización (syncTasks)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe subir los cambios pendientes locales hacia el servidor', async () => {
    // Configurar API mock
    (fetchRemoteTasks as jest.Mock).mockResolvedValue([]);
    (updateRemoteTask as jest.Mock).mockResolvedValue({});

    await syncTasks();

    // Verificamos que se llame a la API con la tarea pendiente
    expect(updateRemoteTask).toHaveBeenCalledWith(1, false);
  });

  it('debe insertar tareas nuevas descargadas del servidor', async () => {
    const remoteData = [
      { id: 2, todo: 'Tarea Nueva desde API', completed: true, userId: 1 }
    ];
    (fetchRemoteTasks as jest.Mock).mockResolvedValue(remoteData);

    const mockCollection = database.collections.get('tasks');
    
    await syncTasks();

    // Verificamos que se prepare la creación para la nueva tarea
    expect(mockCollection.prepareCreate).toHaveBeenCalled();
  });

  it('debe ejecutar todas las transacciones en un solo batch', async () => {
    (fetchRemoteTasks as jest.Mock).mockResolvedValue([
      { id: 2, todo: 'Tarea Nueva desde API', completed: true, userId: 1 }
    ]);

    await syncTasks();

    // Verificamos que se haya ejecutado el comando batch de WatermelonDB para eficiencia
    expect(database.batch).toHaveBeenCalled();
  });
});
