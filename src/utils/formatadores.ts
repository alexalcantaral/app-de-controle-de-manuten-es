/** Formata uma data (ISO string ou Date) como dd/mm/aaaa. */
export const formatarData = (data: string | Date) => {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** Formata uma data com hora: dd/mm/aaaa às HH:MM. */
export const formatarDataHora = (data: string | Date) => {
  const d = typeof data === "string" ? new Date(data) : data;
  return `${formatarData(d)} às ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

/** Formata um CNPJ: 00.000.000/0000-00. */
export const formatarCnpj = (cnpj: string) => {
  if (cnpj.length !== 14) return cnpj;
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

/** Retorna as iniciais de um nome (até 2 letras). */
export const iniciaisDoNome = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

/** Indica se o prazo já passou (comparado ao momento atual). */
export const prazoVencido = (prazo: string) => new Date(prazo) < new Date();
