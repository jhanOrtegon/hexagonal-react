// Archivo de prueba para verificar formateo de Prettier
// eslint-disable-next-line @typescript-eslint/typedef
export const testValue = 'test-value';
export const testObject: { name: string; value: number; items: number[] } = {
  name: 'test',
  value: 123,
  items: [1, 2, 3],
};

export function testFunction(param1: string, param2: number): string {
  return `${param1}-${String(param2)}`;
}
