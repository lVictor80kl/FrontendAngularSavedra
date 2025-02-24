export interface CV {
    id: number;
    name: string;
    lastname: string;
    CI: string; // Cédula de Identidad (única)
    phone: string;
    email: string;
    country: string;
    city: string;
    state: string;
    laboralExperiences: any[]; // Experiencias laborales (arreglo)
    languages: any[]; // Idiomas (arreglo)
    academyFormations: any[]; // Formaciones académicas (arreglo)
    skills: any[]; // Habilidades técnicas (arreglo)
    softSkills: any[]; // Habilidades blandas (arreglo)
    userId: number;
}