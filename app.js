import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

const initialTasks = {
  '2024-05-06': [
    {
      id: '1',
      title: 'Reunião com o time',
      time: '09:30',
      type: 'trabalho',
      notes: 'Alinhar próximos entregáveis e responsabilidades.',
    },
  ],
  '2024-05-07': [
    {
      id: '2',
      title: 'Aula de pilates',
      time: '18:00',
      type: 'bem-estar',
      notes: 'Levar garrafa de água e toalha.',
    },
    {
      id: '3',
      title: 'Entregar relatório mensal',
      time: '16:00',
      type: 'trabalho',
      notes: 'Enviar versão final no e-mail do gestor.',
    },
  ],
  '2024-05-09': [
    {
      id: '4',
      title: 'Aniversário da Ana',
      time: '20:00',
      type: 'pessoal',
      notes: 'Comprar um presente na hora do almoço.',
    },
  ],
};

const typeLabels = {
  trabalho: 'Trabalho',
  pessoal: 'Pessoal',
  'bem-estar': 'Bem-estar',
};

const typeColors = {
  trabalho: '#4F46E5',
  pessoal: '#DB2777',
  'bem-estar': '#059669',
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState(initialTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: '', type: 'trabalho', notes: '' });

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = tasks[selectedKey] ?? [];

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const totalDays = differenceInCalendarDays(end, start) + 1;

    const calendar = [];
    let week = [];

    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(start, i);
      week.push(day);
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      calendar.push(week);
    }

    return calendar;
  }, [currentDate]);

  const handleChangeMonth = (direction) => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const nextDate = new Date(year, month + direction, 1);
    setCurrentDate(nextDate);
    setSelectedDate(nextDate);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day);
  };

  const resetForm = () => {
    setNewTask({ title: '', time: '', type: 'trabalho', notes: '' });
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      return;
    }

    const id = `${Date.now()}`;
    const payload = { ...newTask, id };

    setTasks((prev) => {
      const existing = prev[selectedKey] ?? [];
      return {
        ...prev,
        [selectedKey]: [...existing, payload],
      };
    });

    resetForm();
    setModalVisible(false);
  };

  const monthLabel = format(currentDate, "MMMM' de 'yyyy");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.monthButton} onPress={() => handleChangeMonth(-1)}>
            <Text style={styles.monthButtonText}>‹</Text>
          </Pressable>
          <View>
            <Text style={styles.monthTitle}>{monthLabel}</Text>
            <Text style={styles.monthSubtitle}>Organize seus dias com foco e leveza</Text>
          </View>
          <Pressable style={styles.monthButton} onPress={() => handleChangeMonth(1)}>
            <Text style={styles.monthButtonText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calendar}>
          <View style={styles.weekRow}>
            {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>
          {weeks.map((week, index) => (
            <View key={index} style={styles.weekRow}>
              {week.map((day) => {
                const dayLabel = format(day, 'd');
                const dayKey = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const hasTasks = (tasks[dayKey] ?? []).length > 0;
                const outsideMonth = !isSameMonth(day, currentDate);

                return (
                  <Pressable
                    key={dayKey}
                    style={[styles.dayCell, outsideMonth && styles.dayCellMuted]}
                    onPress={() => handleDayPress(day)}
                  >
                    <View
                      style={[
                        styles.dayBadge,
                        isSelected && styles.dayBadgeSelected,
                        isToday && !isSelected && styles.dayBadgeToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayLabel,
                          isSelected && styles.dayLabelSelected,
                          outsideMonth && styles.dayLabelMuted,
                        ]}
                      >
                        {dayLabel}
                      </Text>
                    </View>
                    {hasTasks && <View style={styles.taskDot} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>Agenda do dia</Text>
          <Text style={styles.agendaDate}>{format(selectedDate, "EEEE, d 'de' MMMM")}</Text>
        </View>

        <ScrollView style={styles.taskList} contentContainerStyle={styles.taskListContent}>
          {dayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Dia livre por aqui ✨</Text>
              <Text style={styles.emptySubtitle}>Aproveite para incluir um novo compromisso ou cuidar de você.</Text>
            </View>
          ) : (
            dayTasks
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((task) => (
                <View key={task.id} style={[styles.taskCard, { borderLeftColor: typeColors[task.type] ?? '#38BDF8' }]}> 
                  <View style={styles.taskCardHeader}>
                    <Text style={styles.taskTime}>{task.time}</Text>
                    <View style={[styles.taskChip, { backgroundColor: `${typeColors[task.type] ?? '#38BDF8'}20` }]}> 
                      <Text style={[styles.taskChipText, { color: typeColors[task.type] ?? '#38BDF8' }]}>{typeLabels[task.type] ?? 'Outro'}</Text>
                    </View>
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.notes ? <Text style={styles.taskNotes}>{task.notes}</Text> : null}
                </View>
              ))
          )}
        </ScrollView>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo compromisso</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Título"
              placeholderTextColor="#9CA3AF"
              value={newTask.title}
              onChangeText={(value) => setNewTask((prev) => ({ ...prev, title: value }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Horário (ex: 14:30)"
              placeholderTextColor="#9CA3AF"
              value={newTask.time}
              onChangeText={(value) => setNewTask((prev) => ({ ...prev, time: value }))}
            />
            <TextInput
              style={[styles.modalInput, styles.modalNotes]}
              placeholder="Notas adicionais"
              placeholderTextColor="#9CA3AF"
              value={newTask.notes}
              onChangeText={(value) => setNewTask((prev) => ({ ...prev, notes: value }))}
              multiline
            />

            <View style={styles.typeSelector}>
              {Object.entries(typeLabels).map(([value, label]) => {
                const isActive = newTask.type === value;
                return (
                  <Pressable
                    key={value}
                    style={[styles.typePill, isActive && { backgroundColor: `${typeColors[value]}22` }]}
                    onPress={() => setNewTask((prev) => ({ ...prev, type: value }))}
                  >
                    <View style={[styles.typeDot, { backgroundColor: typeColors[value] }]} />
                    <Text style={[styles.typeLabel, isActive && { color: typeColors[value] }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddTask}>
                <Text style={styles.confirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  monthTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  monthSubtitle: {
    color: '#CBD5F5',
    fontSize: 14,
    marginTop: 6,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: '#94A3B8',
    fontSize: 28,
    marginTop: -4,
  },
  calendar: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  dayCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  dayCellMuted: {
    opacity: 0.4,
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayBadgeSelected: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dayBadgeToday: {
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  dayLabel: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  dayLabelSelected: {
    color: '#F8FAFC',
  },
  dayLabelMuted: {
    color: '#94A3B8',
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  agendaHeader: {
    marginTop: 28,
    marginBottom: 12,
  },
  agendaTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  agendaDate: {
    color: '#94A3B8',
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 6,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 120,
    gap: 14,
  },
  emptyState: {
    marginTop: 40,
    padding: 24,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  taskCard: {
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 18,
    borderLeftWidth: 4,
    gap: 8,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  taskChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  taskChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  taskNotes: {
    color: '#CBD5F5',
    fontSize: 13,
    lineHeight: 18,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 36,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  addButtonIcon: {
    color: '#F8FAFC',
    fontSize: 34,
    lineHeight: 34,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#111C32',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 15,
  },
  modalNotes: {
    height: 90,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    gap: 8,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
});
