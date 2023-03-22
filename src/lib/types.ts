import { faker } from '@faker-js/faker';
import type { ReportReason } from '@prisma/client';
import md5 from 'md5';
import {
	busLinesByColor,
	metroColorsByLine,
	TADColorsByLine,
	tramColorsByLine
} from './publicTransportColors';
import { ENSEEIHT, lowerFirstChar } from './utils';

export type AppartmentKind =
	| 'chambre'
	| 'studio'
	| 't1'
	| 't1bis'
	| 't2'
	| 't3etplus'
	| 'colocation'
	| 'autre';

export type PublicTransportType = 'bus' | 'bhnf' | 'metro' | 'tram' | 'telepherique' | 'tad';

export const DISPLAY_APPARTMENT_KIND: Record<AppartmentKind, string> = {
	chambre: 'Chambre',
	studio: 'Studio',
	t1: 'T1',
	t1bis: 'T1 bis',
	t2: 'T2',
	t3etplus: 'T3 et plus',
	colocation: 'Colocation',
	autre: 'Autre'
};

export const DISPLAY_PUBLIC_TRANSPORT_TYPE: Record<PublicTransportType, string> = {
	bus: 'bus',
	bhnf: 'tram-bus',
	metro: 'métro',
	tram: 'tramway',
	telepherique: 'téléphérique',
	tad: 'TAD'
};

export const DISPLAY_REPORT_REASON: Record<ReportReason, string> = {
	dangerous: 'Contenu dangereux',
	obsolete: 'Annonce obsolète',
	other: 'Autre'
};

export type PublicTransportStation = {
	name: string;
	line: string;
	type: PublicTransportType;
	color: string | null;
	latitude: number;
	longitude: number;
};

export type Photo = {
	id: string;
	filename: string;
	contentType: string;
	position: number;
	hash: string;
	appartmentId: string | null;
	appartmentEditId: string | null;
};

export type Appartment = {
	photos: Photo[];
	id: string;
	number: number;
	rent: number;
	charges: number;
	deposit: number;
	surface: number;
	kind: AppartmentKind;
	roomsCount: number;
	availableAt: Date;
	createdAt: Date;
	updatedAt: Date;
	address: string;
	approved: boolean;
	archived: boolean;
	latitude: number | null;
	longitude: number | null;
	hasFurniture: boolean | null;
	hasParking: boolean | null;
	hasBicycleParking: boolean | null;
	description: string;
	travelTimeToN7: {
		byFoot: number | null;
		byBike: number | null;
		byPublicTransport: number | null;
	};
	nearbyStations: PublicTransportStation[];
	owner: {
		id: string;
		name: string;
		phone: string;
		email: string;
	};
	reports: Report[];
	history: AppartmentEdit[];
};

export type AppartmentEdit = {
	id: string;
	rent: number;
	charges: number;
	deposit: number;
	surface: number;
	kind: AppartmentKind;
	roomsCount: number;
	availableAt: Date;
	address: string;
	latitude: number | null;
	longitude: number | null;
	hasFurniture: boolean | null;
	hasParking: boolean | null;
	description: string;
	applied: boolean;
	createdAt: Date;
	appliedAt: Date | null;
	appartmentId: string | null;
	photos: Photo[];
};

export type Report = {
	id: string;
	reason: ReportReason;
	message: string;
	createdAt: Date;
	appartmentId: string;
	authorId: string;
};

export type User = {
	id: string;
	name: string;
	phone: string;
	email: string;
	emailIsValidated: boolean;
	admin: boolean;
};

export type SearchCriteria = {
	minimumSurface: number | undefined;
	maximumRent: number | undefined;
	type: AppartmentKind[];
	furniture: boolean | null;
	parking: boolean | null;
	bicycleParking: boolean | null;
};

const randomAppartementSpread = 0.025;
export const randomAppartment: () => Appartment = () => ({
	address: faker.address.streetAddress(true),
	availableAt: faker.date.past(),
	createdAt: faker.date.past(),
	charges: faker.datatype.number({ min: 10, max: 100 }),
	deposit: faker.datatype.number({ min: 20, max: 1500 }),
	description: faker.lorem.paragraphs(3),
	hasFurniture: faker.datatype.boolean(),
	hasParking: faker.datatype.boolean(),
	kind: faker.helpers.arrayElement(Object.keys(DISPLAY_APPARTMENT_KIND)) as AppartmentKind,
	id: faker.datatype.uuid(),
	archived: faker.datatype.boolean(),
	approved: faker.datatype.boolean(),
	photos: [],
	latitude:
		ENSEEIHT.latitude +
		faker.datatype.number({
			max: randomAppartementSpread,
			min: -randomAppartementSpread,
			precision: randomAppartementSpread / 10
		}),
	longitude:
		ENSEEIHT.longitude +
		faker.datatype.number({
			max: randomAppartementSpread,
			min: -randomAppartementSpread,
			precision: randomAppartementSpread / 10
		}),
	nearbyStations: Array(faker.datatype.number({ max: 6, min: 0 }))
		.fill({})
		.map(() => {
			const type = faker.helpers.arrayElement(
				Object.keys(DISPLAY_PUBLIC_TRANSPORT_TYPE)
			) as PublicTransportType;
			let line: string;
			switch (type) {
				case 'bhnf':
					line = `L${faker.datatype.number({ max: 14, min: 1 })}`;
					break;
				case 'bus':
					line = faker.helpers.arrayElement(Object.values(busLinesByColor).flat());
					break;
				case 'metro':
					line = faker.helpers.arrayElement(Object.keys(metroColorsByLine));
					break;
				case 'tad':
					line = faker.helpers.arrayElement(Object.keys(TADColorsByLine));
					break;
				case 'tram':
					line = faker.helpers.arrayElement(Object.keys(tramColorsByLine));
					break;
				case 'telepherique':
					line = 'Téléo';
					break;
			}
			return {
				name: faker.address.streetName(),
				line,
				type,
				color: null,
				latitude:
					ENSEEIHT.latitude +
					faker.datatype.number({
						max: randomAppartementSpread,
						min: -randomAppartementSpread,
						precision: randomAppartementSpread / 10
					}),
				longitude:
					ENSEEIHT.longitude +
					faker.datatype.number({
						max: randomAppartementSpread,
						min: -randomAppartementSpread,
						precision: randomAppartementSpread / 10
					})
			};
		}),
	owner: {
		name: faker.name.fullName(),
		id: faker.datatype.uuid(),
		phone: faker.phone.number(),
		email: faker.internet.email()
	},
	rent: faker.datatype.number({ min: 300, max: 1500 }),
	roomsCount: faker.datatype.number({ max: 5, min: 1 }),
	surface: faker.datatype.number({ max: 100, min: 10 }),
	travelTimeToN7: {
		byBike: faker.datatype.number({ max: 30, min: 5 }) * 60,
		byFoot: faker.datatype.number({ max: 30, min: 5 }) * 60,
		byPublicTransport: faker.datatype.number({ max: 30, min: 5 }) * 60
	},
	reports: []
});

export type GeographicPoint = {
	latitude: number;
	longitude: number;
};

export function appartmentAccessible(
	user: User | null,
	appartment: { approved: boolean; archived: boolean; owner: { id: string } }
) {
	if (appartment.approved && !appartment.archived) return true;

	if (user?.id === appartment.owner.id || user?.admin) return true;

	return false;
}

export function appartmentTitle(appartment: Appartment, insideSentence = false): string {
	const lowercaseDisplayAppartmentKind = Object.fromEntries(
		Object.entries(DISPLAY_APPARTMENT_KIND).map(([key, value]) => {
			switch (key) {
				case 't1':
				case 't1bis':
				case 't2':
				case 't3plus':
					return [key, value];

				default:
					return [key, lowerFirstChar(value)];
			}
		})
	);
	return `${
		appartment.kind == 'autre'
			? insideSentence
				? 'bien'
				: 'Bien'
			: (insideSentence ? lowercaseDisplayAppartmentKind : DISPLAY_APPARTMENT_KIND)[
					appartment.kind
			  ]
	} de ${appartment.surface}m² à ${appartment.rent + appartment.charges}€/mois`;
}

export const tristateCheckboxToBoolean = (value: string) => {
	return (
		{
			indeterminate: null,
			on: true,
			off: false
		}[value] ?? null
	);
};
