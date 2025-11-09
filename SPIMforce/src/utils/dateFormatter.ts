export const formatDateES = (dateString: string | null): string => {
  if (!dateString) return "-";
  
  try {
    // Extraer solo la parte de fecha (YYYY-MM-DD)
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return "-";
  }
};

export const formatDateTime = (dateString: string | null) => {
  if (!dateString) return null;

  try {
    // Espera formato "DD/MM/YYYY HH:mm"
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateString);
      return dateString;
    }

    const formattedDay = String(date.getDate()).padStart(2, '0');
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedYear = date.getFullYear();

    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  } catch (e) {
    console.error('❌ Error formateando fecha:', dateString, e);
    return dateString;
  }
};
