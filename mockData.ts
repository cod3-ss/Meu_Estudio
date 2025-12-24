import { Student, Instructor, Room, Equipment, Transaction, AgendaItem, EscalaItem } from './types';

export const mockStudentsData: Student[] = [
    { id: 'AL-1092', name: 'Maria Oliveira', initials: 'MO', status: 'Ativo', level: 'Intermediário', expiryDate: '23/12/2025', daysToExpiry: 5, schedule: ['Seg - 08:00', 'Qua - 08:00'], instructor: 'Ana Silva', phone: '(11) 98765-4321', birthDate: '2000-12-10', planType: '2x na semana', observations: 'Possui leve escoliose. Focar em exercícios de fortalecimento do core.' },
    { id: 'AL-2283', name: 'Carlos Mendes', initials: 'CM', status: 'Ativo', level: 'Iniciante', expiryDate: '23/12/2025', daysToExpiry: 5, schedule: ['Ter - 18:00'], instructor: 'Bruno Santos', phone: '(11) 99999-8888', birthDate: '1995-12-25', planType: '1x na semana' },
    { id: 'AL-9912', name: 'Fernanda Costa', initials: 'FC', status: 'Ativo', level: 'Avançado', expiryDate: '13/12/2025', daysToExpiry: -5, isExpired: true, schedule: ['Seg - 07:00', 'Qua - 07:00', 'Sex - 07:00'], instructor: 'Carla Dias', phone: '(11) 97777-6666', planType: '3x na semana', observations: 'Atleta de corrida. Apresenta encurtamento nos isquiotibiais.' },
    { id: 'AL-3456', name: 'Lucas Souza', initials: 'LS', status: 'Ativo', level: 'Iniciante', expiryDate: '30/12/2025', daysToExpiry: 12, schedule: ['Ter - 09:00', 'Qui - 09:00'], instructor: 'Daniel Oliveira', phone: '(11) 91234-5678', birthDate: '1998-12-04', planType: '2x na semana' },
    { id: 'AL-7890', name: 'Juliana Pereira', initials: 'JP', status: 'Inativo', level: 'Intermediário', expiryDate: '01/11/2025', daysToExpiry: -47, isExpired: true, schedule: ['Qua - 19:00'], instructor: 'Ana Silva', phone: '(11) 98765-1234', planType: '1x na semana' },
    { id: 'AL-1122', name: 'Rafael Martins', initials: 'RM', status: 'Ativo', level: 'Avançado', expiryDate: '15/01/2026', daysToExpiry: 28, schedule: ['Seg - 20:00', 'Sex - 20:00'], instructor: 'Bruno Santos', phone: '(11) 95555-4444', birthDate: '1992-11-15', planType: '2x na semana' },
    { id: 'AL-3344', name: 'Beatriz Almeida', initials: 'BA', status: 'Ativo', level: 'Iniciante', expiryDate: '28/12/2025', daysToExpiry: 10, schedule: ['Sex - 10:00'], instructor: 'Carla Dias', phone: '(11) 93333-2222', planType: '1x na semana' },
    { id: 'AL-5566', name: 'Gustavo Lima', initials: 'GL', status: 'Ativo', level: 'Intermediário', expiryDate: '05/01/2026', daysToExpiry: 18, schedule: ['Seg - 11:00', 'Qua - 11:00'], instructor: 'Daniel Oliveira', phone: '(11) 91111-9999', planType: '2x na semana' },
    { id: 'AL-7788', name: 'Larissa Ferreira', initials: 'LF', status: 'Ativo', level: 'Avançado', expiryDate: '10/12/2025', daysToExpiry: -8, isExpired: true, schedule: ['Ter - 07:00', 'Qui - 07:00'], instructor: 'Ana Silva', phone: '(11) 98888-7777', planType: '2x na semana' },
    { id: 'AL-9900', name: 'Felipe Rodrigues', initials: 'FR', status: 'Inativo', level: 'Iniciante', expiryDate: '15/10/2025', daysToExpiry: -64, isExpired: true, schedule: ['Sáb - 09:00'], instructor: 'Bruno Santos', phone: '(11) 96666-5555', planType: '1x na semana' },
    { id: 'AL-1234', name: 'Amanda Gomes', initials: 'AG', status: 'Ativo', level: 'Intermediário', expiryDate: '20/01/2026', daysToExpiry: 33, schedule: ['Qua - 14:00', 'Sex - 14:00'], instructor: 'Carla Dias', phone: '(11) 94444-3333', planType: '2x na semana' },
    { id: 'AL-5678', name: 'Thiago Azevedo', initials: 'TA', status: 'Ativo', level: 'Avançado', expiryDate: '25/12/2025', daysToExpiry: 7, schedule: ['Ter - 15:00', 'Qui - 15:00'], instructor: 'Daniel Oliveira', phone: '(11) 92222-1111', planType: '2x na semana' },
    { id: 'AL-2468', name: 'Sofia Ribeiro', initials: 'SR', status: 'Ativo', level: 'Iniciante', expiryDate: '18/12/2025', daysToExpiry: 0, schedule: ['Seg - 16:00'], instructor: 'Ana Silva', phone: '(11) 91212-3434', planType: '1x na semana' },
    { id: 'AL-1357', name: 'Bruno Carvalho', initials: 'BC', status: 'Ativo', level: 'Intermediário', expiryDate: '02/01/2026', daysToExpiry: 15, schedule: ['Qua - 17:00'], instructor: 'Bruno Santos', phone: '(11) 93434-5656', planType: '1x na semana' },
    { id: 'AL-8642', name: 'Camila Nogueira', initials: 'CN', status: 'Inativo', level: 'Avançado', expiryDate: '01/12/2025', daysToExpiry: -17, isExpired: true, schedule: ['Sex - 18:00'], instructor: 'Carla Dias', phone: '(11) 95656-7878', planType: '1x na semana' },
    { id: 'AL-1011', name: 'Eduardo Teixeira', initials: 'ET', status: 'Ativo', level: 'Iniciante', expiryDate: '12/01/2026', daysToExpiry: 25, schedule: ['Ter - 11:00', 'Qui - 11:00'], instructor: 'Daniel Oliveira', phone: '(11) 97878-9090', planType: '2x na semana' },
    { id: 'AL-1213', name: 'Vanessa Barbosa', initials: 'VB', status: 'Ativo', level: 'Intermediário', expiryDate: '22/12/2025', daysToExpiry: 4, schedule: ['Seg - 13:00'], instructor: 'Ana Silva', phone: '(11) 99090-1212', planType: '1x na semana' },
    { id: 'AL-1415', name: 'Ricardo Dias', initials: 'RD', status: 'Ativo', level: 'Avançado', expiryDate: '14/12/2025', daysToExpiry: -4, isExpired: true, schedule: ['Sáb - 11:00'], instructor: 'Bruno Santos', phone: '(11) 91313-2424', planType: '1x na semana' },
    { id: 'AL-1617', name: 'Tatiane Cruz', initials: 'TC', status: 'Ativo', level: 'Iniciante', expiryDate: '29/12/2025', daysToExpiry: 11, schedule: ['Qua - 09:00', 'Sex - 09:00'], instructor: 'Carla Dias', phone: '(11) 92525-3636', planType: '2x na semana' },
    { id: 'AL-1819', name: 'Leonardo Cavalcanti', initials: 'LC', status: 'Inativo', level: 'Intermediário', expiryDate: '10/11/2025', daysToExpiry: -38, isExpired: true, schedule: ['Ter - 20:00'], instructor: 'Daniel Oliveira', phone: '(11) 93737-4848', planType: '1x na semana' },
    { id: 'AL-2021', name: 'Alice Correia', initials: 'AC', status: 'Ativo', level: 'Avançado', expiryDate: '08/01/2026', daysToExpiry: 21, schedule: ['Seg - 06:00', 'Qua - 06:00', 'Sex - 06:00'], instructor: 'Ana Silva', phone: '(11) 94949-6060', planType: '3x na semana' },
    { id: 'AL-2223', name: 'Rodrigo Lopes', initials: 'RL', status: 'Ativo', level: 'Iniciante', expiryDate: '27/12/2025', daysToExpiry: 9, schedule: ['Qui - 14:00'], instructor: 'Bruno Santos', phone: '(11) 96161-7272', planType: '1x na semana' },
    { id: 'AL-2425', name: 'Sandra Pires', initials: 'SP', status: 'Ativo', level: 'Intermediário', expiryDate: '03/01/2026', daysToExpiry: 16, schedule: ['Ter - 16:00', 'Qui - 16:00'], instructor: 'Carla Dias', phone: '(11) 97373-8484', planType: '2x na semana' },
    { id: 'AL-2627', name: 'Márcio Cunha', initials: 'MC', status: 'Ativo', level: 'Avançado', expiryDate: '19/12/2025', daysToExpiry: 1, schedule: ['Seg - 10:00'], instructor: 'Daniel Oliveira', phone: '(11) 98585-9696', planType: '1x na semana' },
    { id: 'AL-2829', name: 'Priscila Mota', initials: 'PM', status: 'Inativo', level: 'Iniciante', expiryDate: '05/11/2025', daysToExpiry: -43, isExpired: true, schedule: ['Qua - 15:00'], instructor: 'Ana Silva', phone: '(11) 99797-0808', planType: '1x na semana' },
    { id: 'AL-3031', name: 'Alexandre Moreira', initials: 'AM', status: 'Ativo', level: 'Intermediário', expiryDate: '17/01/2026', daysToExpiry: 30, schedule: ['Sex - 12:00'], instructor: 'Bruno Santos', phone: '(11) 91010-2121', planType: '1x na semana' },
    { id: 'AL-3233', name: 'Gabriela Pinto', initials: 'GP', status: 'Ativo', level: 'Avançado', expiryDate: '24/12/2025', daysToExpiry: 6, schedule: ['Ter - 13:00', 'Qui - 13:00'], instructor: 'Carla Dias', phone: '(11) 92323-3434', planType: '2x na semana' },
    { id: 'AL-3435', name: 'Daniela Fogaça', initials: 'DF', status: 'Ativo', level: 'Iniciante', expiryDate: '11/01/2026', daysToExpiry: 24, schedule: ['Sáb - 10:00'], instructor: 'Daniel Oliveira', phone: '(11) 93535-4646', planType: '1x na semana' },
    { id: 'AL-3637', name: 'Igor Neves', initials: 'IN', status: 'Ativo', level: 'Intermediário', expiryDate: '21/12/2025', daysToExpiry: 3, schedule: ['Seg - 17:00', 'Qua - 17:00'], instructor: 'Ana Silva', phone: '(11) 94747-5858', planType: '2x na semana' },
    { id: 'AL-3839', name: 'Cláudia Ramos', initials: 'CR', status: 'Inativo', level: 'Avançado', expiryDate: '20/10/2025', daysToExpiry: -59, isExpired: true, schedule: ['Ter - 19:00'], instructor: 'Bruno Santos', phone: '(11) 95959-7070', planType: '1x na semana' },
    { id: 'AL-4041', name: 'Sérgio Melo', initials: 'SM', status: 'Ativo', level: 'Iniciante', expiryDate: '06/01/2026', daysToExpiry: 19, schedule: ['Qui - 18:00'], instructor: 'Carla Dias', phone: '(11) 97171-8282', planType: '1x na semana' },
    { id: 'AL-4243', name: 'Renata Castro', initials: 'RC', status: 'Ativo', level: 'Intermediário', expiryDate: '26/12/2025', daysToExpiry: 8, schedule: ['Sex - 15:00'], instructor: 'Daniel Oliveira', phone: '(11) 98383-9494', planType: '1x na semana' },
    { id: 'AL-4445', name: 'Vinícius Rocha', initials: 'VR', status: 'Ativo', level: 'Avançado', expiryDate: '16/12/2025', daysToExpiry: -2, isExpired: true, schedule: ['Seg - 19:00', 'Qua - 19:00'], instructor: 'Ana Silva', phone: '(11) 99595-0606', planType: '2x na semana' },
    { id: 'AL-4647', name: 'Débora Aragão', initials: 'DA', status: 'Ativo', level: 'Iniciante', expiryDate: '09/01/2026', daysToExpiry: 22, schedule: ['Ter - 06:00'], instructor: 'Bruno Santos', phone: '(11) 90707-1818', planType: '1x na semana' },
    { id: 'AL-4849', name: 'Paulo Andrade', initials: 'PA', status: 'Inativo', level: 'Intermediário', expiryDate: '30/09/2025', daysToExpiry: -79, isExpired: true, schedule: ['Qui - 20:00'], instructor: 'Carla Dias', phone: '(11) 91919-3030', planType: '1x na semana' },
    { id: 'AL-5051', name: 'Adriana Campos', initials: 'AC', status: 'Ativo', level: 'Avançado', expiryDate: '13/01/2026', daysToExpiry: 26, schedule: ['Sex - 08:00'], instructor: 'Daniel Oliveira', phone: '(11) 93131-4242', planType: '1x na semana' },
    { id: 'AL-5253', name: 'Flávio Duarte', initials: 'FD', status: 'Ativo', level: 'Iniciante', expiryDate: '31/12/2025', daysToExpiry: 13, schedule: ['Seg - 14:00', 'Qua - 14:00'], instructor: 'Ana Silva', phone: '(11) 94343-5454', planType: '2x na semana' },
    { id: 'AL-5455', name: 'Cintia Salles', initials: 'CS', status: 'Ativo', level: 'Intermediário', expiryDate: '20/12/2025', daysToExpiry: 2, schedule: ['Ter - 12:00', 'Qui - 12:00'], instructor: 'Bruno Santos', phone: '(11) 95555-6666', planType: '2x na semana' },
    { id: 'AL-5657', name: 'Jonas Siqueira', initials: 'JS', status: 'Ativo', level: 'Avançado', expiryDate: '04/01/2026', daysToExpiry: 17, schedule: ['Sex - 16:00'], instructor: 'Carla Dias', phone: '(11) 96767-7878', planType: '1x na semana' },
    { id: 'AL-5859', name: 'Eliane Xavier', initials: 'EX', status: 'Inativo', level: 'Iniciante', expiryDate: '15/09/2025', daysToExpiry: -94, isExpired: true, schedule: ['Sáb - 08:00'], instructor: 'Daniel Oliveira', phone: '(11) 97979-9090', planType: '1x na semana' },
    { id: 'AL-6061', name: 'Marcelo Pimenta', initials: 'MP', status: 'Ativo', level: 'Intermediário', expiryDate: '18/01/2026', daysToExpiry: 31, schedule: ['Seg - 12:00'], instructor: 'Ana Silva', phone: '(11) 99191-0202', planType: '1x na semana' },
    { id: 'AL-6263', name: 'Simone Franco', initials: 'SF', status: 'Ativo', level: 'Avançado', expiryDate: '07/01/2026', daysToExpiry: 20, schedule: ['Ter - 17:00', 'Qui - 17:00'], instructor: 'Bruno Santos', phone: '(11) 90303-1414', planType: '2x na semana' },
    { id: 'AL-6465', name: 'Otávio Brandão', initials: 'OB', status: 'Ativo', level: 'Iniciante', expiryDate: '28/12/2025', daysToExpiry: 10, schedule: ['Qua - 10:00', 'Sex - 10:00'], instructor: 'Carla Dias', phone: '(11) 91515-2626', planType: '2x na semana' },
    { id: 'AL-6667', name: 'Helena Matos', initials: 'HM', status: 'Ativo', level: 'Intermediário', expiryDate: '17/12/2025', daysToExpiry: -1, isExpired: true, schedule: ['Seg - 21:00'], instructor: 'Daniel Oliveira', phone: '(11) 92727-3838', planType: '1x na semana' },
    { id: 'AL-6869', name: 'Anderson Leal', initials: 'AL', status: 'Inativo', level: 'Avançado', expiryDate: '01/09/2025', daysToExpiry: -108, isExpired: true, schedule: ['Ter - 21:00'], instructor: 'Ana Silva', phone: '(11) 93939-5050', planType: '1x na semana' },
    { id: 'AL-7071', name: 'Laura Barreto', initials: 'LB', status: 'Ativo', level: 'Iniciante', expiryDate: '10/01/2026', daysToExpiry: 23, schedule: ['Qua - 20:00'], instructor: 'Bruno Santos', phone: '(11) 95151-6262', planType: '1x na semana' },
    { id: 'AL-7273', name: 'Roberto Juncos', initials: 'RJ', status: 'Ativo', level: 'Intermediário', expiryDate: '01/01/2026', daysToExpiry: 14, schedule: ['Qui - 06:00', 'Sáb - 12:00', 'Dom - 10:00'], instructor: 'Carla Dias', phone: '(11) 96363-7474', planType: '3x na semana' }
];

export const mockInstructorsData: Instructor[] = [
    { id: '1', name: 'Ana Silva', initials: 'AS', studentsCount: 0, phone: '(11) 91111-1111', specialties: 'Fisioterapia, Pilates Clássico', avatarColor: 'bg-rose-600', cpf: '111.111.111-11', password: '123456', clientId: 'CLI-001', workingDays: ['Seg', 'Qua', 'Sex'], workStart: '07:00', workEnd: '12:00', classDuration: 50 },
    { id: '2', name: 'Bruno Santos', initials: 'BS', studentsCount: 0, phone: '(11) 92222-2222', specialties: 'Ed. Física, Pilates Contemporâneo', avatarColor: 'bg-blue-600', cpf: '222.222.222-22', password: '123456', clientId: 'CLI-001', workingDays: ['Ter', 'Qui'], workStart: '08:00', workEnd: '21:00', classDuration: 60 },
    { id: '3', name: 'Carla Dias', initials: 'CD', studentsCount: 0, phone: '(11) 93333-3333', specialties: 'Fisioterapia', avatarColor: 'bg-orange-500', cpf: '333.333.333-33', password: '123456', clientId: 'CLI-003', workingDays: ['Seg', 'Qua'], workStart: '14:00', workEnd: '20:00', classDuration: 50 },
    { id: '4', name: 'Daniel Oliveira', initials: 'DO', studentsCount: 0, phone: '(11) 94444-4444', specialties: 'Ed. Física', avatarColor: 'bg-emerald-600', cpf: '444.444.444-44', password: '123456', clientId: 'CLI-003', workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], workStart: '07:00', workEnd: '21:00', classDuration: 50 }
];

export const mockRoomsData: Room[] = [
    { id: '1', name: 'Sala Principal' },
    { id: '2', name: 'Sala Zen' },
    { id: '3', name: 'Sala de Mat' }
];

export const mockEquipmentsData: Equipment[] = [
    { id: '1', name: 'Reformer 1', type: 'Reformer', roomName: 'Sala Principal' },
    { id: '2', name: 'Reformer 2', type: 'Reformer', roomName: 'Sala Principal' },
    { id: '3', name: 'Cadillac', type: 'Cadillac', roomName: 'Sala Principal' },
    { id: '4', name: 'Chair', type: 'Chair', roomName: 'Sala Zen' },
    { id: '5', name: 'Ladder Barrel', type: 'Barrel', roomName: 'Sala Zen' },
    { id: '6', name: 'Mat (Tapete)', type: 'Acessório', roomName: 'Sala de Mat' },
];

export const mockTransactionsData: Transaction[] = [
    { id: '1', description: 'Mensalidade - Maria Oliveira', amount: 250, date: '2025-12-05', type: 'Receita', category: 'Mensalidade', status: 'Pago' },
    { id: '2', description: 'Pagamento Salário - Ana Silva', amount: 1200, date: '2025-12-05', type: 'Despesa', category: 'Salários', status: 'Pago' },
    { id: '3', description: 'Conta de Luz', amount: 180.50, date: '2025-12-10', type: 'Despesa', category: 'Infraestrutura', status: 'Pago' },
    { id: '4', description: 'Mensalidade - Carlos Mendes', amount: 250, date: '2025-12-10', type: 'Receita', category: 'Mensalidade', status: 'Pago' },
    { id: '5', description: 'Aluguel do Espaço', amount: 2500, date: '2025-12-10', type: 'Despesa', category: 'Aluguel', status: 'Pago' },
    { id: '6', description: 'Mensalidade - Fernanda Costa', amount: 320, date: '2025-12-15', type: 'Receita', category: 'Mensalidade', status: 'Pendente' },
    { id: '7', description: 'Compra de Acessórios (Faixas)', amount: 150, date: '2025-12-18', type: 'Despesa', category: 'Equipamentos', status: 'Pago' },
];

export const mockAgendaData: AgendaItem[] = [
    { id: '1', time: '07:00', day: 0, student: 'Fernanda Costa', instructor: 'Carla Dias', instructorInitials: 'CD', color: 'orange' },
    { id: '2', time: '07:00', day: 1, student: 'Larissa Ferreira', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '3', time: '07:00', day: 2, student: 'Fernanda Costa', instructor: 'Carla Dias', instructorInitials: 'CD', color: 'orange' },
    { id: '4', time: '07:00', day: 3, student: 'Larissa Ferreira', instructor: 'Bruno Santos', instructorInitials: 'BS', color: 'blue' },
    { id: '5', time: '07:00', day: 3, student: 'Lucas Souza', instructor: 'Daniel Oliveira', instructorInitials: 'DO', color: 'green' },
    { id: '6', time: '07:00', day: 3, student: 'Maria Oliveira', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '7', time: '08:00', day: 0, student: 'Maria Oliveira', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '8', time: '08:00', day: 2, student: 'Maria Oliveira', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '9', time: '09:00', day: 1, student: 'Lucas Souza', instructor: 'Daniel Oliveira', instructorInitials: 'DO', color: 'green' },
    { id: '10', time: '09:00', day: 3, student: 'Lucas Souza', instructor: 'Daniel Oliveira', instructorInitials: 'DO', color: 'green' },
    { id: '11', time: '18:00', day: 1, student: 'Carlos Mendes', instructor: 'Bruno Santos', instructorInitials: 'BS', color: 'blue' },
    { id: '12', time: '10:00', day: 6, student: 'Roberto Juncos', instructor: 'Carla Dias', instructorInitials: 'CD', color: 'orange' },
];

export const mockEscalaData: EscalaItem[] = [
    { id: '1', time: '07:00', day: 0, equipment: 'Reformer 1', roomName: 'Sala Principal', instructor: 'Carla Dias', instructorInitials: 'CD', color: 'orange' },
    { id: '2', time: '07:00', day: 1, equipment: 'Reformer 2', roomName: 'Sala Principal', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '3', time: '07:00', day: 2, equipment: 'Cadillac', roomName: 'Sala Principal', instructor: 'Carla Dias', instructorInitials: 'CD', color: 'orange' },
    { id: '4', time: '07:00', day: 3, equipment: 'Reformer 1', roomName: 'Sala Principal', instructor: 'Bruno Santos', instructorInitials: 'BS', color: 'blue' },
    { id: '5', time: '07:00', day: 3, equipment: 'Reformer 2', roomName: 'Sala Principal', instructor: 'Daniel Oliveira', instructorInitials: 'DO', color: 'green' },
    { id: '6', time: '07:00', day: 3, equipment: 'Chair', roomName: 'Sala Zen', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '7', time: '08:00', day: 0, equipment: 'Chair', roomName: 'Sala Zen', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '8', time: '08:00', day: 2, equipment: 'Ladder Barrel', roomName: 'Sala Zen', instructor: 'Ana Silva', instructorInitials: 'AS', color: 'pink' },
    { id: '9', time: '09:00', day: 1, equipment: 'Cadillac', roomName: 'Sala Principal', instructor: 'Daniel Oliveira', instructorInitials: 'DO', color: 'green' },
    { id: '10', time: '09:00', day: 3, equipment: 'Chair', roomName: 'Sala Zen', instructor: 'Daniel Oliveira', instructorInitials: 'DO', color: 'green' },
    { id: '11', time: '18:00', day: 1, equipment: 'Ladder Barrel', roomName: 'Sala Zen', instructor: 'Bruno Santos', instructorInitials: 'BS', color: 'blue' },
    { id: '12', time: '10:00', day: 6, equipment: 'Mat (Tapete)', roomName: 'Sala de Mat', instructor: 'Carla Dias', instructorInitials: 'CD', color: 'orange' },
];