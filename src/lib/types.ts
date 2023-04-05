// Generated by ts-to-zod
import { z, type ZodErrorMap, type ZodInvalidTypeIssue } from 'zod';
import { lowerFirstChar } from './utils';

export type WithUndefinableProperties<T> = {
	[P in keyof T]: T[P] | undefined;
};

export type ReportReason = z.infer<typeof ReportReasonSchema>;
export const ReportReasonSchema = z.union([
	z.literal('dangerous'),
	z.literal('obsolete'),
	z.literal('other')
]);
export const DISPLAY_REPORT_REASON: Record<ReportReason, string> = {
	dangerous: 'Contenu dangereux',
	obsolete: 'Annonce obsolète',
	other: 'Autre'
};

export type AppartmentKind = z.infer<typeof AppartmentKindSchema>;
export const AppartmentKindSchema = z.union([
	z.literal('chambre'),
	z.literal('studio'),
	z.literal('t1'),
	z.literal('t1bis'),
	z.literal('t2'),
	z.literal('t3etplus'),
	z.literal('colocation'),
	z.literal('autre')
]);
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

export type PublicTransportType = z.infer<typeof PublicTransportTypeSchema>;
export const PublicTransportTypeSchema = z.union([
	z.literal('bus'),
	z.literal('bhnf'),
	z.literal('metro'),
	z.literal('tram'),
	z.literal('telepherique'),
	z.literal('tad')
]);
export const DISPLAY_PUBLIC_TRANSPORT_TYPE: Record<PublicTransportType, string> = {
	bus: 'bus',
	bhnf: 'tram-bus',
	metro: 'métro',
	tram: 'tramway',
	telepherique: 'téléphérique',
	tad: 'TAD'
};

export type PublicTransportStation = z.infer<typeof PublicTransportStationSchema>;
export const PublicTransportStationSchema = z.object({
	name: z.string(),
	line: z.string(),
	type: PublicTransportTypeSchema,
	color: z.string().nullable(),
	latitude: z.number(),
	longitude: z.number()
});

export type Photo = z.infer<typeof PhotoSchema>;
export const PhotoSchema = z.object({
	filename: z.string(),
	contentType: z.string(),
	position: z.number(),
	hash: z.string().nullable()
});

export type AppartmentEdit = z.infer<typeof AppartmentEditSchema>;
export const AppartmentEditSchema = z.object({
	rent: z.number(),
	charges: z.number(),
	deposit: z.number(),
	surface: z.number(),
	kind: AppartmentKindSchema,
	roomsCount: z.number(),
	availableAt: z.date(),
	address: z.string(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	hasFurniture: z.boolean().nullable(),
	hasParking: z.boolean().nullable(),
	hasBicycleParking: z.boolean().nullable(),
	description: z.string(),
	applied: z.boolean(),
	createdAt: z.date(),
	appliedAt: z.date().nullable(),
	appartmentId: z.string().nullable(),
	photos: z.array(PhotoSchema)
});

/**
 * Returns the edit that was made just before the given edit, based on the appliedAt date. Only works for edits that have been applied.
 */
export function editBefore(history: AppartmentEdit[], edit: AppartmentEdit & { appliedAt: Date }) {
	return history.filter((e) => e.appliedAt !== null).find((e) => e.appliedAt < edit.appliedAt);
}

export type Report = z.infer<typeof ReportSchema>;
export const ReportSchema = z.object({
	reason: ReportReasonSchema,
	message: z.string(),
	createdAt: z.date(),
	appartmentId: z.string(),
	authorId: z.string()
});

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string(),
	email: z.string(),
	emailIsValidated: z.boolean(),
	admin: z.boolean(),
	god: z.boolean()
});

export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;
export const SearchCriteriaSchema = z.object({
	minimumSurface: z.number().nullable(),
	maximumRent: z.number().nullable(),
	type: z.array(AppartmentKindSchema),
	furniture: z.boolean().nullable(),
	parking: z.boolean().nullable(),
	bicycleParking: z.boolean().nullable()
});

export type GeographicPoint = z.infer<typeof GeographicPointSchema>;
export const GeographicPointSchema = z.object({
	latitude: z.number(),
	longitude: z.number()
});

export const AppartmentSchema = z.object({
	photos: z.array(PhotoSchema),
	rent: z.number().nonnegative({
		message: 'Le loyer doit être positif'
	}),
	charges: z.number().nonnegative({
		message: 'Les charges doivent être positif'
	}),
	deposit: z.number().nonnegative({
		message: 'Le dépôt de garantie doit être positif'
	}),
	surface: z.number().positive({
		message: 'La surface doit être positive et non nulle'
	}),
	kind: AppartmentKindSchema,
	roomsCount: z.number().nonnegative({
		message: 'Le nombre de chambres doit positif'
	}),
	availableAt: z.date(),
	address: z.string(),
	hasFurniture: z.boolean().nullable(),
	hasParking: z.boolean().nullable(),
	hasBicycleParking: z.boolean().nullable(),
	description: z.string()
});
export type Appartment = z.infer<typeof AppartmentSchema>;

export const EMPTY_APPARTMENT: WithUndefinableProperties<Appartment> = {
	address: '',
	availableAt: undefined,
	charges: undefined,
	deposit: undefined,
	description: '',
	hasFurniture: null,
	hasParking: null,
	hasBicycleParking: null,
	kind: undefined,
	photos: [],
	rent: undefined,
	roomsCount: 0,
	surface: undefined
};

export function appartmentAccessible(
	user: (User & { id: string }) | null,
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

export const ternaryStateCheckboxToBoolean = (value: string) => {
	return (
		{
			indeterminate: null,
			on: true,
			off: false
		}[value] ?? null
	);
};
