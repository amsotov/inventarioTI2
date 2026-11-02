export type MailResult =
  | { result: "aceptado"; providerRef: string }
  | { result: "transitorio" | "permanente" | "incierto" };
export interface MailPort {
  send(message: {
    to: string;
    subject: string;
    text: string;
    correlation: string;
  }): Promise<MailResult>;
}
export type Notice = {
  proposito: string;
  entidad?: string;
  referencia?: string;
  accion?: string;
  actor?: string;
  registrada?: string;
  efectiva?: string | null;
  campos?: string[];
};
