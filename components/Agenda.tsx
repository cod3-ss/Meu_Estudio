import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import { ChevronLeft, ChevronRight, Users, Clock, Check, Plus, AlertTriangle, X } from 'lucide-react';
import GroupedAgendaCard from './GroupedAgendaCard';
import { AgendaItem } from '../types';
import { sendWhatsAppMessage } from '../chatbotUtils'; // Importa a função do chatbot

const Agenda: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { instructors, students, agenda: appointments, escala: escalaItems, user, settings } = state;

  const isAdmin = user?.role === 'admin';
  
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date()); // 22 de Dezembro, 2025
  const [isInstructorOpen, setIsInstructorOpen] = useState(false);
  // Se for instrutor, já começa filtrado por ele mesmo
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(!isAdmin ? user?.name || null : null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [formData, setFormData] = useState<AgendaItem>({ id: '', time: '07:00', day: 0, student: '', instructor: '', instructorInitials: '', color: 'blue' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AgendaItem | null>(null);

  const setAppointments = (items: AgendaItem[]) => {
      dispatch({ type: 'UPDATE_AGENDA', payload: items });
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsInstructorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulação de Lembretes de Aula
  useEffect(() => {
    if (settings.chatbotSettings?.isEnabled && settings.chatbotSettings.classReminder.isEnabled) {
      const today = new Date();
      const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
      const currentHour = today.getHours();
      const hoursBefore = settings.chatbotSettings.classReminder.hoursBefore;

      appointments.filter(a => a.day === todayDayIndex).forEach(async (item) => {
        const [itemHour, itemMinute] = item.time.split(':').map(Number);
        const classTime = itemHour * 60 + itemMinute;
        const currentTime = currentHour * 60; // Ignorando minutos atuais por simplificação

        if (classTime > currentTime && (classTime - currentTime) <= (hoursBefore * 60)) {
          const student = students.find(s => s.name === item.student);
          if (student) {
            await sendWhatsAppMessage({
              student: student,
              templateKey: 'classReminder',
              studioSettings: settings,
              agendaItems: appointments,
              allStudents: students,
              additionalVars: { hora: item.time },
            });
          }
        }
      });
    }
  }, [currentDate, appointments, settings, students]); // Roda quando a data ou agenda mudam (simula verificação diária)


  const timeSlots = Array.from({ length: 17 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

  const getFilteredAppointments = (time: string, dayIdx: number) => {
    const appointmentsInSlot = appointments.filter(a => {
      const matchTime = a.time === time;
      const matchDay = a.day === dayIdx;
      
      // Regra: Instrutor só vê o dele. Admin pode ver todos ou filtrar.
      let matchInstructor = true;
      if (!isAdmin) {
          matchInstructor = a.instructor === user?.name;
      } else if (selectedInstructor) {
          matchInstructor = a.instructor === selectedInstructor;
      }

      return matchTime && matchDay && matchInstructor;
    });

    return appointmentsInSlot.map(appointment => {
      const equipmentItem = escalaItems.find(
        e => e.day === appointment.day && e.time === appointment.time && e.instructor === appointment.instructor
      );
      return {
        ...appointment,
        equipment: equipmentItem ? equipmentItem.equipment : undefined,
        roomName: equipmentItem ? equipmentItem.roomName : undefined
      };
    });
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'daily') newDate.setDate(currentDate.getDate() + direction);
    else if (view === 'weekly') newDate.setDate(currentDate.getDate() + (direction * 7));
    else if (view === 'monthly') newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDayName = (date: Date, format: 'short' | 'full' = 'short') => {
    const names = format === 'short' 
      ? ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.']
      : ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return names[date.getDay()];
  };
  
  const getFullMonthName = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handleOpenModal = (item: AgendaItem | null, day?: number, time?: string) => {
    setEditingItem(item);
    if(item) {
        setFormData(item);
    } else {
        const defaultInstructor = !isAdmin ? instructors.find(i => i.name === user?.name) : instructors[0];
        setFormData({
            id: '',
            time: time || '07:00',
            day: day !== undefined ? day : 0,
            student: '',
            instructor: defaultInstructor?.name || '',
            instructorInitials: defaultInstructor?.initials || '',
            color: 'blue'
        });
    }
    setIsModalOpen(true);
  };
  
  const handleSave = async () => { // Adicionado 'async' aqui
    if (!formData.student || !formData.instructor) return;

    const selectedInst = instructors.find(i => i.name === formData.instructor);
    const colorMap: { [key: string]: 'orange' | 'blue' | 'pink' | 'green' } = {
        'Ana Silva': 'pink', 'Bruno Santos': 'blue', 'Carla Dias': 'orange', 'Daniel Oliveira': 'green'
    };

    let isReschedule = false; // Flag para o chatbot
    let originalStudentName = '';
    let newScheduleTime = '';


    if (editingItem) {
        isReschedule = true;
        originalStudentName = editingItem.student;
        newScheduleTime = `${getDayName(new Date(2025,11,15 + formData.day), 'full')} às ${formData.time}`;

        // Ação de Reposição/Remarcação
        // 1. Achar a aula original (raiz da corrente de remarcações).
        let rootOriginalId = editingItem.id;
        let currentItem = editingItem;
        while (currentItem.originalId) {
            const parent = appointments.find(a => a.id === currentItem.originalId);
            if (parent) {
                rootOriginalId = parent.id;
                currentItem = parent;
            } else {
                break; // Corrente quebrada, parar.
            }
        }
        
        // 2. Filtrar todas as aulas não relacionadas e a aula original.
        const otherAppointments = appointments.filter(
            item => item.id !== rootOriginalId && item.originalId !== rootOriginalId
        );
        const rootItem = appointments.find(item => item.id === rootOriginalId);

        if (!rootItem) {
            setIsModalOpen(false);
            return; // Salvaguarda, não deve acontecer.
        }

        // 3. Marcar a aula original como "remarcada".
        const updatedRootItem = { ...rootItem, status: 'rescheduled_source' as const };
        
        // 4. Criar a nova aula de reposição, apontando para a original.
        const rescheduledClass: AgendaItem = {
            ...formData,
            id: Date.now().toString(),
            instructorInitials: selectedInst?.initials || '??',
            color: colorMap[selectedInst?.name || ''] || 'blue',
            status: 'rescheduled_target',
            originalId: rootOriginalId
        };
        
        // 5. Atualizar o estado com as aulas não relacionadas, a original atualizada e a nova reposição.
        setAppointments([...otherAppointments, updatedRootItem, rescheduledClass]);
    } else {
        // Ação de Criar nova aula (Experimental)
        const newItem: AgendaItem = {
            ...formData,
            instructorInitials: selectedInst?.initials || '??',
            color: colorMap[selectedInst?.name || ''] || 'blue',
            id: Date.now().toString(),
            status: 'scheduled'
        };
        setAppointments([...appointments, newItem]);
    }
    setIsModalOpen(false);

    // Lógica do Chatbot para notificação de remarcação
    if (isReschedule && settings.chatbotSettings?.rescheduleNotification.isEnabled) {
      const studentToNotify = students.find(s => s.name === originalStudentName);
      if (studentToNotify) {
        await sendWhatsAppMessage({
          student: studentToNotify,
          templateKey: 'rescheduleNotification',
          studioSettings: settings,
          agendaItems: appointments,
          allStudents: students,
          additionalVars: { novo_horario: newScheduleTime },
        });
      }
    }
  };

  const handleDeleteClick = (item: AgendaItem) => {
      setItemToDelete(item);
      setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!itemToDelete) return;

    let updatedAppointments = [...appointments];

    if (itemToDelete.status === 'rescheduled_target' && itemToDelete.originalId) {
        // Excluir reposição: reverte a original para 'agendada' e remove a reposição.
        updatedAppointments = updatedAppointments
            .map((item): AgendaItem => item.id === itemToDelete.originalId ? { ...item, status: 'scheduled' } : item)
            .filter(item => item.id !== itemToDelete.id);
    } else if (itemToDelete.status === 'rescheduled_source') {
        // Excluir original remarcada: remove a original e sua reposição.
        updatedAppointments = updatedAppointments.filter(
            item => item.id !== itemToDelete.id && item.originalId !== itemToDelete.id
        );
    } else {
        // Excluir aula normal
        updatedAppointments = updatedAppointments.filter(item => item.id !== itemToDelete.id);
    }

    setAppointments(updatedAppointments);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const renderDaily = () => {
    const dayOfWeek = currentDate.getDay();
    const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 

    return (
      <div className="bg-white dark:bg-transparent rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-[48px_1fr]">
          <div className="p-4 border-b border-r border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-sky-500 mb-1">{getDayName(currentDate)}</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{currentDate.getDate()}</span>
          </div>
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 flex items-center">
            <Clock className="text-sky-500 mr-2" size={16} />
            <h3 className="font-bold text-slate-700 dark:text-gray-300 text-sm">Cronograma do Dia</h3>
          </div>
          {timeSlots.map((time) => {
              const appointmentsInSlot = getFilteredAppointments(time, dayIdx);
              const groupedByInstructor = appointmentsInSlot.reduce<Record<string, AgendaItem[]>>((acc, appointment) => {
                  (acc[appointment.instructor] = acc[appointment.instructor] || []).push(appointment);
                  return acc;
              }, {});

              return (
                <React.Fragment key={time}>
                  <div className="p-2 text-center border-b border-r border-slate-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-900">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{time}</span>
                  </div>
                  <div className="p-4 border-b border-slate-200 dark:border-gray-800 min-h-[120px] transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5 group relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.values(groupedByInstructor).map((items) => (
                        <GroupedAgendaCard key={items[0].instructor} items={items} onEdit={handleOpenModal} onDelete={handleDeleteClick}/>
                      ))}
                    </div>
                    <button onClick={() => handleOpenModal(null, dayIdx, time)} className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 bg-sky-500/80 rounded-full shadow-lg text-white"><Plus size={16} /></div>
                    </button>
                  </div>
                </React.Fragment>
              );
          })}
        </div>
      </div>
    );
  };

  const renderWeekly = () => {
    const current = new Date(currentDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        name: getDayName(d),
        date: d.getDate(),
        fullDate: d,
        active: d.toDateString() === currentDate.toDateString()
      };
    });

    return (
      <div className="bg-white dark:bg-transparent rounded-2xl border border-slate-200 dark:border-gray-800 overflow-auto max-h-[75vh] custom-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-[48px_repeat(7,1fr)] min-w-[800px] relative">
          <div className="sticky top-0 left-0 z-40 py-1 px-2 border-b border-r border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900"></div>
          {weekDays.map((day, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentDate(day.fullDate)}
              className={`sticky top-0 z-30 py-1 px-2 border-b border-slate-200 dark:border-gray-800 text-center flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-sky-500/5 bg-slate-50 dark:bg-gray-900`}
            >
              <span className={`text-[10px] font-bold tracking-wider mb-1 ${day.active ? 'text-sky-500' : 'text-slate-500 dark:text-gray-400'}`}>
                {day.name}
              </span>
              <span className={`text-xl font-bold ${day.active ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-gray-300'}`}>
                {day.date}
              </span>
              {day.active && <div className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>}
            </div>
          ))}

          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="sticky left-0 z-20 p-2 text-center border-b border-r border-slate-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-900">
                <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">{time}</span>
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                const appointmentsInSlot = getFilteredAppointments(time, dayIdx);
                const groupedByInstructor = appointmentsInSlot.reduce<Record<string, AgendaItem[]>>((acc, appointment) => {
                    (acc[appointment.instructor] = acc[appointment.instructor] || []).push(appointment);
                    return acc;
                }, {});

                return (
                    <div key={`${time}-${dayIdx}`} className="p-1.5 border-b border-slate-200 dark:border-gray-800 min-h-[100px] relative transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5 group">
                      <div className="flex flex-col gap-1.5">
                        {Object.values(groupedByInstructor).map((items) => (
                            <GroupedAgendaCard key={items[0].instructor} items={items} onEdit={handleOpenModal} onDelete={handleDeleteClick}/>
                        ))}
                      </div>
                      <button onClick={() => handleOpenModal(null, dayIdx, time)} className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="p-2 bg-sky-500/80 rounded-full shadow-lg text-white"><Plus size={16} /></div>
                      </button>
                    </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthly = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDay = startOfMonth.getDay();

    const monthDays = Array.from({ length: 42 }, (_, i) => {
      const day = i - startDay + 1;
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return {
        date: d.getDate(),
        fullDate: d,
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        isToday: d.toDateString() === currentDate.toDateString()
      };
    });

    const dayHeaders = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    
    const handleDayClick = (day: {fullDate: Date}) => {
      setCurrentDate(day.fullDate);
      setView('daily');
    };

    return (
      <div className="bg-white dark:bg-transparent rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900">
          {dayHeaders.map(h => (
            <div key={h} className="p-2 md:p-4 text-center text-[10px] font-bold text-slate-500 dark:text-gray-400 tracking-widest uppercase">{h}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthDays.map((day, idx) => (
            <div 
              key={idx} 
              onClick={() => handleDayClick(day)}
              className={`min-h-[60px] md:min-h-[100px] p-2 md:p-3 border-b border-r border-slate-200 dark:border-gray-800 transition-all cursor-pointer flex flex-col gap-2 ${
                !day.isCurrentMonth ? 'opacity-30 bg-slate-50 dark:bg-gray-800/20 pointer-events-none' : 'hover:bg-slate-50 dark:hover:bg-white/5'
              } ${day.isToday ? 'bg-sky-500/10' : ''}`}
            >
              <span className={`text-xs md:text-sm font-bold ${day.isToday ? 'text-sky-500' : 'text-slate-500 dark:text-gray-400'}`}>
                {day.date}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {day.isCurrentMonth && appointments.filter(a => {
                    const matchDay = a.day === (day.fullDate.getDay() === 0 ? 6 : day.fullDate.getDay() - 1);
                    if (!isAdmin) return matchDay && a.instructor === user?.name;
                    return matchDay;
                }).slice(0, 4).map(a => (
                  <div key={a.id} className={`h-1.5 w-1.5 rounded-full ${
                    a.color === 'orange' ? 'bg-orange-500' : a.color === 'blue' ? 'bg-blue-600' : a.color === 'pink' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} title={`${a.student} - ${a.instructor}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    if (view === 'daily') return currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    if (view === 'weekly') {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(start.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `${monday.getDate()} de ${getFullMonthName(monday).split(' de ')[0]} - ${sunday.getDate()} de ${getFullMonthName(sunday)}`;
    }
    return getFullMonthName(currentDate);
  };
  
  const viewOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
  ];

  const getModalTitle = () => {
    if (editingItem) {
        return `Repor / Remarcar: ${editingItem.student}`;
    }
    return 'Agendar Aula Experimental';
  };

  return (
    <div className="space-y-6 pt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <div className="flex items-center bg-white dark:bg-gray-900/40 rounded-lg border border-slate-200 dark:border-gray-800 p-1 shadow-sm">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-500 dark:text-gray-400 transition-colors"><ChevronLeft size={18} /></button>
            <div className="px-2 sm:px-4 text-sm font-semibold text-slate-700 dark:text-gray-300 capitalize min-w-[140px] text-center">{getTitle()}</div>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-500 dark:text-gray-400 transition-colors"><ChevronRight size={18} /></button>
          </div>

          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsInstructorOpen(!isInstructorOpen)} className={`flex w-full justify-between items-center gap-2 bg-white dark:bg-gray-900/40 border px-4 py-2.5 rounded-lg text-sm transition-all ${selectedInstructor ? 'border-sky-500/50 text-sky-500' : 'border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-gray-700'}`}>
                <Users size={16} className={selectedInstructor ? 'text-sky-500' : 'text-gray-500 dark:text-gray-400'} />
                <span className="font-medium">{selectedInstructor || 'Todos Instrutores'}</span>
                <ChevronRight size={14} className={`transition-transform duration-200 ${isInstructorOpen ? '-rotate-90' : 'rotate-90 text-gray-500'}`} />
                </button>
                {isInstructorOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl shadow-2xl z-[60] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                    <button onClick={() => { setSelectedInstructor(null); setIsInstructorOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-sky-500 transition-colors"><span>Todos os Instrutores</span>{!selectedInstructor && <Check size={14} className="text-sky-500" />}</button>
                    <div className="h-[1px] bg-slate-200 dark:bg-gray-800 mx-2 my-1"></div>
                    {instructors.map(instr => (<button key={instr.id} onClick={() => { setSelectedInstructor(instr.name); setIsInstructorOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-sky-500 transition-colors"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${instr.avatarColor}`}></div><span>{instr.name}</span></div>{selectedInstructor === instr.name && <Check size={14} className="text-sky-500" />}</button>))}
                </div>
                )}
            </div>
          )}
        </div>
        <div className="flex items-center bg-white dark:bg-gray-900/40 rounded-lg border border-slate-200 dark:border-gray-800 p-1 shadow-sm">
          {viewOptions.map(v => <button key={v.value} onClick={() => setView(v.value as any)} className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md ${view === v.value ? 'bg-sky-500/10 text-sky-500' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}`}>{v.label}</button>)}
        </div>
      </div>
      <div className="relative min-h-[500px]">
        {view === 'daily' && renderDaily()}
        {view === 'weekly' && renderWeekly()}
        {view === 'monthly' && renderMonthly()}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-gray-100">{getModalTitle()}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Dia da Semana</label><select value={formData.day} onChange={e => setFormData({...formData, day: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm">{[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{getDayName(new Date(2025,11,15+d), 'full')}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Horário</label><input type="time" step="3600" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm"/></div>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Aluno</label>
                  {editingItem ? (
                      <div className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-500 dark:text-gray-400 text-sm font-medium">{formData.student}</div>
                  ) : (
                      <input
                          value={formData.student}
                          onChange={e => setFormData({ ...formData, student: e.target.value })}
                          placeholder="Nome do aluno (experimental)"
                          className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm"
                      />
                  )}
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Instrutor</label>
              <select 
                value={formData.instructor} 
                onChange={e => setFormData({...formData, instructor: e.target.value})} 
                disabled={!isAdmin}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm disabled:opacity-50"
              >
                {instructors.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
              </select></div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar</button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 text-center"><div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Remover Aula?</h3><p className="text-sm text-slate-500 dark:text-gray-400">Esta ação é irreversível. Deseja remover a aula do aluno <span className="font-bold text-slate-700 dark:text-gray-200">{itemToDelete?.student}</span>?</p></div>
            <div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 uppercase tracking-widest text-xs">Sim, Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;