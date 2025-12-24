import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Home, Plus, Pencil, Trash2, Box, AlertTriangle, X } from 'lucide-react';
import { Room, Equipment } from '../types';
import EquipmentCard from './EquipmentCard';

const RoomsAndEquipment: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { rooms, equipments } = state;

  const setRooms = (newRooms: Room[]) => dispatch({ type: 'UPDATE_ROOMS', payload: newRooms });
  const setEquipments = (newEquipments: Equipment[]) => dispatch({ type: 'UPDATE_EQUIPMENTS', payload: newEquipments });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');

  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({ name: '', type: '', roomName: 'Sala Principal' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'room' | 'equipment', data: Room | Equipment } | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const handleOpenRoomModal = (room: Room | null) => {
    setEditingRoom(room);
    setRoomName(room ? room.name : '');
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = () => {
    if (!roomName.trim()) return;
    let updatedRooms;
    if (editingRoom) {
      updatedRooms = rooms.map(r => r.id === editingRoom.id ? { ...r, name: roomName } : r);
    } else {
      const newRoom: Room = { id: Date.now().toString(), name: roomName };
      updatedRooms = [...rooms, newRoom];
    }
    setRooms(updatedRooms);
    setIsRoomModalOpen(false);
  };

  const handleOpenEquipmentModal = (equipment: Equipment | null) => {
    setEditingEquipment(equipment);
    setEquipmentForm(equipment ? { name: equipment.name, type: equipment.type, roomName: equipment.roomName } : { name: '', type: '', roomName: rooms[0]?.name || '' });
    setIsEquipmentModalOpen(true);
  };
  
  const handleSaveEquipment = () => {
    if (!equipmentForm.name.trim() || !equipmentForm.type.trim()) return;
    let updatedEquipments;
    if (editingEquipment) {
      updatedEquipments = equipments.map(e => e.id === editingEquipment.id ? { ...e, ...equipmentForm } : e);
    } else {
      const newEquipment: Equipment = { id: Date.now().toString(), ...equipmentForm };
      updatedEquipments = [...equipments, newEquipment];
    }
    setEquipments(updatedEquipments);
    setIsEquipmentModalOpen(false);
  };

  const handleDeleteClick = (type: 'room' | 'equipment', data: Room | Equipment) => {
    setItemToDelete({ type, data });
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'room') {
      setRooms(rooms.filter(r => r.id !== itemToDelete.data.id));
    } else {
      setEquipments(equipments.filter(e => e.id !== itemToDelete.data.id));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };
  
  const equipmentCountByRoom = useMemo(() => {
    return rooms.reduce((acc, room) => {
      acc[room.name] = equipments.filter(e => e.roomName === room.name).length;
      return acc;
    }, {} as Record<string, number>);
  }, [rooms, equipments]);

  const filteredEquipments = useMemo(() => {
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    return equipments.filter(eq => {
      const matchesRoom = !selectedRoom || eq.roomName === selectedRoom.name;
      return matchesRoom;
    });
  }, [equipments, selectedRoomId, rooms]);

  return (
    <div className="relative pt-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Salas & Aparelhos</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Coluna de Salas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest">
              <Home size={14} /> Salas de Atendimento
            </div>
            <button onClick={() => handleOpenRoomModal(null)} className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 font-bold py-2 px-3 rounded-lg text-[10px] transition-all border border-slate-200 dark:border-gray-800">
              <Plus size={12} /> Nova Sala
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedRoomId(null)}
              className={`w-full text-left p-4 rounded-lg transition-all border-2 ${!selectedRoomId ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white dark:bg-gray-900/40 border-transparent hover:border-slate-200 dark:hover:border-gray-800'}`}
            >
              <h4 className="font-bold text-slate-800 dark:text-gray-100">Todas as Salas</h4>
              <span className="text-xs text-slate-500 dark:text-gray-400">{equipments.length} aparelhos no total</span>
            </button>
            {rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full text-left p-4 rounded-lg transition-all border-2 cursor-pointer ${selectedRoomId === room.id ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white dark:bg-gray-900/40 border-transparent hover:border-slate-200 dark:hover:border-gray-800'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-gray-100">{room.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-gray-400">{equipmentCountByRoom[room.name] || 0} aparelhos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenRoomModal(room); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-gray-400 dark:text-gray-500 hover:text-sky-500"><Pencil size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick('room', room); }} className="p-1.5 hover:bg-rose-500/10 rounded-md text-gray-400 dark:text-gray-500 hover:text-rose-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna de Aparelhos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest">
              <Box size={14} /> 
              <span>Aparelhos em: <span className="text-slate-800 dark:text-gray-100">{selectedRoomId ? rooms.find(r=>r.id === selectedRoomId)?.name : 'Todas as Salas'}</span></span>
            </div>
            <button onClick={() => handleOpenEquipmentModal(null)} className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition-all whitespace-nowrap">
              <Plus size={12} /> Novo Aparelho
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEquipments.length > 0 ? filteredEquipments.map(eq => (
              <EquipmentCard key={eq.id} equipment={eq} onEdit={handleOpenEquipmentModal} onDelete={() => handleDeleteClick('equipment', eq)} />
            )) : (
              <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-gray-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-800">
                <Box size={40} className="text-slate-300 dark:text-gray-700 mb-4" />
                <h4 className="font-bold text-slate-600 dark:text-gray-400">Nenhum Aparelho Encontrado</h4>
                <p className="text-xs text-slate-400 dark:text-gray-500">Tente ajustar os filtros ou adicione um novo aparelho.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal para Salas */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-gray-100">{editingRoom ? 'Editar Sala' : 'Nova Sala'}</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome da Sala</label>
                <input value={roomName} onChange={e => setRoomName(e.target.value)} autoFocus className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" />
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button onClick={() => setIsRoomModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleSaveRoom} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Aparelhos */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-gray-100">{editingEquipment ? 'Editar Aparelho' : 'Novo Aparelho'}</h3>
              <button onClick={() => setIsEquipmentModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome do Aparelho</label>
                <input value={equipmentForm.name} onChange={e => setEquipmentForm({...equipmentForm, name: e.target.value})} autoFocus className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Tipo / Categoria</label>
                <input value={equipmentForm.type} onChange={e => setEquipmentForm({...equipmentForm, type: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder="Ex: Reformer, Cadillac..."/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Alocado na Sala</label>
                <select value={equipmentForm.roomName} onChange={e => setEquipmentForm({...equipmentForm, roomName: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm">
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button onClick={() => setIsEquipmentModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleSaveEquipment} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Genérico de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Confirmar Exclusão?</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                A ação removerá permanentemente <span className="font-bold text-slate-700 dark:text-gray-200">{itemToDelete?.data.name}</span> e não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors uppercase tracking-widest">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 uppercase tracking-widest text-xs">Sim, Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsAndEquipment;