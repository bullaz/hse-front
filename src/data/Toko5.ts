import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
//import type { AxiosInstance } from 'axios';

//type EmployeeRole = 'Market' | 'Finance' | 'Development';

export interface Question {
    questionId: number;
    nom: string;
    pictrogramme: string;
    categorie: string;
    required: boolean;
}

export interface Commentaire {
    commentaireId: number;
    nom: string;
    prenom: string;
    commentaire: string;
}

export interface MesureControle {
    mesureControleId: number;
    question: Question;
    mesurePrise: string;
    implemented: boolean;
}


export interface Toko5 {
    toko5Id: string;
    nomContractant: string;
    prenomContractant: string;
    dateHeure: Date;
    etat: string;
    listCommentaire: Commentaire[];
    listMesureControle: MesureControle[];
}

const INITIAL_LIST_TOKO5: Toko5[] = [
    {
        toko5Id: "befe1e48-cde9-49ef-bae8-8ca64a7900f5 ",
        nomContractant: 'Rakoto',
        prenomContractant: 'Jean',
        dateHeure: new Date('2025-12-11T00:00:00.000Z'),
        etat: 'valide',
        listCommentaire: [{
            commentaireId: 0,
            nom: 'Rakoto',
            prenom: 'Jean',
            commentaire: 'tapaka ny jiro'
        }],
        listMesureControle: [
            {
                mesureControleId: 0,
                question: {
                    questionId: 0,
                    nom: 'alerte feu',
                    pictrogramme: 'fire_warning',
                    categorie: 'risk',
                    required: false
                },
                mesurePrise: 'afindra ny matos',
                implemented: true
            },
            {
                mesureControleId: 0,
                question: {
                    questionId: 0,
                    nom: 'alerte electricite',
                    pictrogramme: 'electricity',
                    categorie: 'risk',
                    required: false
                },
                mesurePrise: 'afindra ny matos',
                implemented: false
            }
        ],
    },
    {
        toko5Id: "15a8d753-b64c-48d4-befc-e06533dcb619 ",
        nomContractant: 'Rakoto',
        prenomContractant: 'Jean',
        dateHeure: new Date('2025-12-11T00:00:00.000Z'),
        etat: 'valide',
        listCommentaire: [{
            commentaireId: 0,
            nom: 'Rakoto',
            prenom: 'Jean',
            commentaire: 'tapaka ny jiro'
        }],
        listMesureControle: [
            {
                mesureControleId: 0,
                question: {
                    questionId: 1,
                    nom: 'alerte feu',
                    pictrogramme: 'fire_warning',
                    categorie: 'risk',
                    required: false
                },
                mesurePrise: 'afindra ny matos',
                implemented: true
            },
            {
                mesureControleId: 0,
                question: {
                    questionId: 2,
                    nom: 'alerte electricite',
                    pictrogramme: 'electricity',
                    categorie: 'risk',
                    required: false
                },
                mesurePrise: 'afindra ny matos',
                implemented: false
            }
        ],
    },
];

export function getListToko5(): Toko5[] {
    const stringifiedToko5s = localStorage.getItem('toko5-store');
    return stringifiedToko5s ? JSON.parse(stringifiedToko5s) : INITIAL_LIST_TOKO5;
}

export function setListToko5(toko5s: Toko5[]) {
    return localStorage.setItem('list-toko5', JSON.stringify(toko5s));
}

export async function getMany({
    paginationModel,
    filterModel,
    sortModel,
    listToko5
    // axiosInstance
}: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
    listToko5: Toko5[];
    //axiosInstance: AxiosInstance
}): Promise<{ items: Toko5[]; itemCount: number }> {

    let filteredToko5s = [...listToko5];

    // Apply filters (example only)
    if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
                return;
            }

            filteredToko5s = filteredToko5s.filter((toko5) => {
                const toko5Value = toko5[field as keyof Toko5];

                switch (operator) {
                    case 'contains':
                        return String(toko5Value).toLowerCase().includes(String(value).toLowerCase());
                    case 'equals':
                        return toko5Value === value;
                    case 'startsWith':
                        return String(toko5Value).toLowerCase().startsWith(String(value).toLowerCase());
                    case 'endsWith':
                        return String(toko5Value).toLowerCase().endsWith(String(value).toLowerCase());
                    case '>':
                        return toko5Value > value;
                    case '<':
                        return toko5Value < value;
                    default:
                        return true;
                }
            });
        });
    }

    // Apply sorting
    if (sortModel?.length) {
        filteredToko5s.sort((a, b) => {
            for (const { field, sort } of sortModel) {
                if (a[field as keyof Toko5] < b[field as keyof Toko5]) {
                    return sort === 'asc' ? -1 : 1;
                }
                if (a[field as keyof Toko5] > b[field as keyof Toko5]) {
                    return sort === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }

    // Apply pagination
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedToko5s = filteredToko5s.slice(start, end);

    return {
        items: paginatedToko5s,
        itemCount: filteredToko5s.length,
    };
}




export async function getOne(toko5Id: string) {
    const listToko5 = getListToko5();

    const toko5ToShow = listToko5.find((toko5) => toko5.toko5Id === toko5Id);

    if (!toko5ToShow) {
        throw new Error('toko5 not found');
    }
    return toko5ToShow;
}

export async function createOne(data: Omit<Toko5, 'toko5Id'>) {
    const listToko5 = getListToko5();

    const newToko5 = {
        toko5Id: 'uuid', 
        ...data,
    };

    setListToko5([...listToko5, newToko5]);

    return newToko5;
}



export async function updateOne(toko5Id: string, data: Partial<Omit<Toko5, 'id'>>) {
    const listToko5 = getListToko5();

    let updatedToko5: Toko5 | null = null;

    setListToko5(
        listToko5.map((toko5) => {
            if (toko5.toko5Id === toko5Id) {
                updatedToko5 = { ...toko5, ...data };
                return updatedToko5;
            }
            return toko5;
        }),
    );

    if (!updatedToko5) {
        throw new Error('Toko5 not found');
    }
    return updatedToko5;
}

export async function deleteOne(toko5Id: string) {
    const listToko5 = getListToko5();

    setListToko5(listToko5.filter((toko5) => toko5.toko5Id !== toko5Id));
}

// Validation follows the [Standard Schema](https://standardschema.dev/).

type ValidationResult = { issues: { message: string; path: (keyof Toko5)[] }[] };

export function validate(toko5: Partial<Toko5>): ValidationResult {
    let issues: ValidationResult['issues'] = [];

    if (!toko5.nomContractant) {
        issues = [...issues, { message: 'Le nom est requis', path: ['nomContractant'] }];
    }

    // if (!toko5.age) {
    //     issues = [...issues, { message: 'Age is required', path: ['age'] }];
    // } else if (toko5.age < 18) {
    //     issues = [...issues, { message: 'Age must be at least 18', path: ['age'] }];
    // }

    // if (!toko5.joinDate) {
    //     issues = [...issues, { message: 'Join date is required', path: ['joinDate'] }];
    // }

    // if (!toko5.role) {
    //     issues = [...issues, { message: 'Role is required', path: ['role'] }];
    // } else if (!['Market', 'Finance', 'Development'].includes(toko5.role)) {
    //     issues = [
    //         ...issues,
    //         { message: 'Role must be "Market", "Finance" or "Development"', path: ['role'] },
    //     ];
    // }

    return { issues };
}
