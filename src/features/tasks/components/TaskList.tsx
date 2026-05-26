import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { Q } from '@nozbe/watermelondb';
import TaskItem from './TaskItem';
import Task from '../../../core/database/models/Task';
import { database } from '../../../core/database/database';
import { TaskFilter } from '../../useTaskStore';

interface TaskListProps {
  filter: TaskFilter;
  userEmail: string;
  searchText: string;   // 👈 nueva prop
  onRefresh?: () => void;
  refreshing?: boolean;
}

const TaskList = ({
  filter,
  userEmail,
  searchText,
  onRefresh,
  refreshing
}: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const collection = database.get<Task>('tasks');
    const userFilter = Q.where('user_id', userEmail);

    const query =
      filter === 'Completadas'
        ? collection.query(userFilter, Q.where('completed', true))
        : filter === 'Pendientes'
        ? collection.query(userFilter, Q.where('completed', false))
        : collection.query(userFilter);

    const subscription = query.observe().subscribe(setTasks);

    return () => subscription.unsubscribe();
  }, [filter, userEmail]);

  // 👇 filtro de búsqueda
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchText.toLowerCase())
  );

  if (filteredTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay tareas</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredTasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TaskItem task={item} />}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8'
  },
});

export default TaskList;