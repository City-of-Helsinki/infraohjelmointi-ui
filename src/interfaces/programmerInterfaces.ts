export interface IProgrammer {
  id: string;
  firstName: string;
  lastName: string;
}

export interface IProjectClass {
  id: string;
  name: string;
  defaultProgrammer?: IProgrammer;
}
