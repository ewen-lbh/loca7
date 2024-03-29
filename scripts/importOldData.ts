import { PrismaClient } from '@prisma/client';
import { convert as html2text } from 'html-to-text';
import { distanceBetween, ENSEEIHT } from '../src/lib/utils';
import { createGhostEmail, DISPLAY_PUBLIC_TRANSPORT_TYPE } from '../src/lib/types';
import type {
	Photo,
	GeographicPoint,
	PublicTransportStation,
	PublicTransportType
} from '../src/lib/types';
import sharp from 'sharp';
import Autolinker from 'autolinker';
import { checksumFile } from '../src/lib/server/utils';
// import { openRouteService } from '../src/lib/server/traveltime';
import xss from 'xss';
import type { User, TravelTimeToN7, Report, AppartmentKind } from '@prisma/client';
import tisseoStops from '../public/tisseo-stops.json' assert { type: 'json' };
import lucia from 'lucia-auth';
import luciaPrismaAdapter from '@lucia-auth/adapter-prisma';
import createPassword from 'password';
import oldLogements from './old-data/logements.json' assert { type: 'json' };
import oldPhotos from './old-data/photos.json' assert { type: 'json' };
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import nqdm from 'nqdm';

const __dirname = dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();
const auth = lucia({
	adapter: luciaPrismaAdapter(prisma),
	env: 'DEV',
	transformUserData(userData) {
		return {
			id: userData.id,
			name: userData.name,
			email: userData.email,
			phone: userData.phone,
			emailIsValidated: userData.emailIsValidated,
			admin: userData.admin
		} as User;
	}
});

function bbcode2html(text: bbcodestr): string {
	return Autolinker.link(
		text
			.replaceAll(/\r?\n/gi, '<br>')
			.replaceAll(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>')
			.replaceAll(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>')
			.replaceAll(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
			.replaceAll(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>')
			.replaceAll(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="$1">$2</a>')
			.replaceAll(/\[url\](.*?)\[\/url\]/gi, '<a href="$1">$1</a>')
			.replaceAll(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" />')
			.replaceAll(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color: $1">$2</span>')
			.replaceAll(/\[quote\](.*?)\[\/quote\]/gi, '<blockquote>$1</blockquote>')
			.replaceAll(/\[list\]/gi, '<ul>')
			.replaceAll(/\[\/list\]/gi, '</ul>')
			.replaceAll(/\[\*\]/gi, '<li>')
			.replaceAll(
				/\[size=(.+?)\](.+?)\[\/size\]/gi,
				'<span style="font-size: $1px">$2</span>'
			)
			.replaceAll(/\[br\]/gi, '<br>')
			.replaceAll(/\[h([1-6])\](.+?)\[\/h([1-6])\]/gi, '<h$1>$2</h$3>'),
		{
			newWindow: false
		}
	);
}

function agencyFromEmail(email: string): { agencyName: string; agencyWebsite: string } {
	const domain = email.split('@')[1];
	const [agencyName, agencyWebsite] = {
		'athome-ah.com': ['At Home', 'athome-ah.com'],
		'aubuisson.com': ['Aubuisson', 'aubuisson.com'],
		'cegetel.net': ['Cegetel', 'cegetel.net'],
		'cia-toulouse.com': ['Cabinet Immobilier Araud', 'cia-toulouse.com'],
		'dols-invest.fr': ['Dols Invest', ''],
		'eraimmo.fr': ['ERA', 'era-immobilier-midi-pyrenees.fr'],
		'orpi.com': ['Orpi', 'orpi.com'],
		'privilegeservices.fr': ['LP Services', 'www.groupelp-services.com']
	}?.[domain] ?? ['', ''];
	return { agencyName, agencyWebsite };
}

function fixEmailTypos(email: string): string {
	return email
		.replace(/@g[ml]ail.com/gi, '@gmail.com')
		.replace(/@[0o]range.fr/gi, '@orange.fr')
		.replace(/@9[io][bn]line.fr/gi, '@9online.fr');
}

async function nearbyStations(location: GeographicPoint): Promise<PublicTransportStation[]> {
	const allStops = tisseoStops as {
		stop_id: `stop_point:SP_${number}`;
		stop_code: `${number}`;
		stop_name: string;
		stop_lat: number;
		stop_lon: number;
		route_type:
			| 'tram'
			| 'metro'
			| 'train'
			| 'bus'
			| 'ferry'
			| 'cable_car'
			| 'gondola'
			| 'funicular'
			| 'trolleybus'
			| 'monorail';
		parent_station: `stop_area:SA_${number}`;
		wheelchair_boarding: boolean | null;
		route_id: string;
		agency_id: string;
		route_short_name: string;
		route_long_name: string;
		route_color: string;
		route_text_color: string;
		location_type: 'stop' | 'station' | 'entrance' | 'generic' | 'boarding_area';
	}[];

	return allStops
		.map((stop) => ({
			...stop,
			position: { latitude: stop.stop_lat, longitude: stop.stop_lon }
		}))
		.filter((stop) => Object.keys(DISPLAY_PUBLIC_TRANSPORT_TYPE).includes(stop.route_type))
		.filter((stop) => Math.abs(distanceBetween(location, stop.position)) < 500)
		.sort(
			(a, b) => distanceBetween(location, a.position) - distanceBetween(location, b.position)
		)
		.filter(
			(stop, i, self) =>
				self.findIndex(
					(s) =>
						s.route_short_name === stop.route_short_name &&
						s.route_type === stop.route_type
				) === i
		)
		.map((stop) => ({
			color: '#' + stop.route_color,
			line: stop.route_short_name,
			name: stop.stop_name,
			type:
				stop.route_type === 'bus' && /L\d{1,3}/.test(stop.route_short_name)
					? 'bhnf'
					: (stop.route_type as PublicTransportType),
			latitude: stop.stop_lon,
			longitude: stop.stop_lat
		}));
}

type datetimestr = string;
type bbcodestr = string;
type intstr = string;
type floatstr = string;
type boolstr = '0' | '1';

type AppartmentOld = {
	date_maj: datetimestr;
	typel: 'ch' | 'st' | 'co' | 't1' | 't1b' | 't2' | 't3p' | 'au';
	surface: intstr | null;
	loyer: intstr;
	montant_charges: intstr | null;
	montant_caution: intstr | null;
	place_parking: boolstr | null;
	free_date: datetimestr;
	meuble: boolstr | null;
	adresse: string;
	latitude: floatstr | null;
	longitude: floatstr | null;
	description: bbcodestr;
	contact_nom: string;
	contact_prenom: string;
	contact_mail: string;
	contact_tel: string;
	contact_port: string;
	pub_date: datetimestr;
	statut: '0' | '1' | '2' | '3';
	nb_obsolete: intstr;
	uuid_proprietaire: string;
	id: string;
};

type PhotoOld = {
	id: string;
	logement_id: string;
	photo: string;
};

const KIND_MAP: Record<AppartmentOld['typel'], AppartmentKind> = {
	ch: 'chambre',
	st: 'studio',
	co: 'colocation',
	t1: 't1',
	t1b: 't1bis',
	t2: 't2',
	t3p: 't3etplus',
	au: 'autre'
};

function optionalNumberStr(str: intstr | floatstr | null): number | null {
	if (str === null) return null;
	return Number(str);
}

function optionalBooleanStr(str: boolstr | null): boolean | null {
	if (str === null) return null;
	return str === '1';
}

function status(status: AppartmentOld['statut']): { archived: boolean; approved: boolean } {
	switch (status) {
		case '0':
			// Published
			return { archived: false, approved: true };

		case '1':
			// Archived
			return { archived: true, approved: true };

		case '2':
			// Pending
			return { archived: false, approved: false };

		case '3':
			// Deleted (same as archived)
			return { archived: true, approved: true };

		default:
			throw new Error('Unknown status: ' + status);
	}
}

function findRoomsCountInDescription(description: string): number {
	// Convert bbcode to plaintext
	description = html2text(bbcode2html(description))
		// Replace number words
		.replaceAll(/\bdeux\b/gi, '2')
		.replaceAll(/\btrois\b/gi, '3')
		.replaceAll(/\bquatre\b/gi, '4')
		.replaceAll(/\bcinq\b/gi, '5')
		.replaceAll(/\bsix\b/gi, '6')
		.replaceAll(/\bsept\b/gi, '7')
		.replaceAll(/\bhuit\b/gi, '8')
		.replaceAll(/\bneuf\b/gi, '9')
		.replaceAll(/\bdix\b/gi, '10')
		.replaceAll(/\bun\b/gi, '1')
		.replaceAll(/\bune\b/gi, '1')
		// Fix up some typos
		.replaceAll(/\bùeubl/gi, 'meubl');

	// extract number
	const result = /\b(\d+)\s+chambre/gi.exec(description);
	if (!result) return 0;
	return Number(result[1]);
}

function detectKindFromDescription(appart: AppartmentOld): AppartmentKind | null {
	if (appart.typel !== 'au') return null;

	const description = appart.description.toLowerCase();

	if (/\bt1 bis\b/.test(description)) return 't1bis';

	if (/\bt1\b/.test(description)) return 't1';

	if (/\bt2\b/.test(description)) return 't2';

	if (/\bt\d\b/.test(description)) return 't3etplus';

	if (/\bstudio\b/.test(description)) return 'studio';

	if (/\bcolocation\b/.test(description)) return 'colocation';

	return null;
}

function detectBicycleParkingFromDescription(appart: AppartmentOld): boolean | null {
	return (
		/(\b(parking|cour|local|garage|parc|rack|parcage|rangement|emplacement|range-?)\s*([àa]|pour\s*(mettre\s*(éventuellement)?\s*(des)?)?)?\s*v[ée]los?\b)|(\b(garer|ranger|parquer|déposer)\s*(un|votre|les|des|son|ton)?\s*v[ée]los?\b)/gi.test(
			appart.description.toLowerCase()
		) || null
	);
}

function detectFiberInternetFromDescription(appart: AppartmentOld): boolean | null {
	return /(\b(fibre)\n)/gi.test(appart.description.toLowerCase()) || null;
}
function detectElevatorFromDescription(appart: AppartmentOld): boolean | null {
	return /(\b(ascenseur)\n)/gi.test(appart.description.toLowerCase()) || null;
}

async function appartment(ghost: User, appart: AppartmentOld, photos: PhotoOld[], user: User) {
	let latitude = optionalNumberStr(appart.latitude);
	let longitude = optionalNumberStr(appart.longitude);
	if (latitude && Math.abs(latitude - 43) > 1) {
		// console
		// 	.log
		// 	`⚠️ Appartment ${appart.adresse} (#${appart.id}) has aberrant latitude ${latitude}, discarding geocoordinates`
		// 	();
		latitude = null;
		longitude = null;
	}
	// console.info(`\tCreating appartment ${appart.adresse} (#${appart.id})`);
	const appartment = await prisma.appartment.create({
		data: {
			address: appart.adresse,
			number: optionalNumberStr(appart.id) || undefined,
			availableAt: new Date(appart.free_date),
			charges: optionalNumberStr(appart.montant_charges) || 0,
			deposit: optionalNumberStr(appart.montant_caution) || 0,
			description: xss(
				'<p>' +
					bbcode2html(appart.description.replace(/\u0001/g, ''))
						.split('<br>')
						.map((line) => `<span>${line}</span>`)
						.join('<br>') +
					'</p>'
			),
			kind: detectKindFromDescription(appart) ?? KIND_MAP[appart.typel] ?? 'autre',
			// FIXME tkt
			latitude: longitude,
			longitude: latitude,
			rent: Number(appart.loyer),
			surface: optionalNumberStr(appart.surface) || 0,
			roomsCount: findRoomsCountInDescription(appart.description),
			...status(appart.statut),
			updatedAt: new Date(appart.date_maj),
			createdAt: new Date(appart.pub_date),
			hasFurniture: optionalBooleanStr(appart.meuble),
			hasParking: optionalBooleanStr(appart.place_parking),
			hasBicycleParking: detectBicycleParkingFromDescription(appart),
			hasFiberInternet: detectFiberInternetFromDescription(appart),
			hasElevator: detectElevatorFromDescription(appart),
			importedFromOldSite: true,
			owner: {
				connect: {
					id: user.id
				}
			},
			travelTimeToN7: {
				create: {
					byBike: null,
					byPublicTransport: null,
					byFoot: null
				}
			},
			nearbyStations: {
				createMany: {
					data: latitude && longitude ? await nearbyStations({ longitude, latitude }) : []
				}
			},
			photos: {
				createMany: {
					data: await Promise.all(
						photos
							.filter((photo) => photo.logement_id == appart.id)
							.map(
								async (photo, i) =>
									({
										contentType: 'image/jpeg',
										filename: path.basename(photo.photo),
										position: i,
										hash: await checksumFile(
											path.join(__dirname, 'old-data', photo?.photo)
										)
									} as Photo)
							)
					)
				}
			},
			reports: {
				createMany: {
					data: Array.from({ length: Number(appart.nb_obsolete) }).map(
						() =>
							({
								authorId: ghost.id,
								reason: 'obsolete',
								createdAt: new Date(appart.date_maj),
								message: "L'annonce est obsolète (importé depuis l'ancien site)"
							} as Report)
					)
				}
			}
		},
		include: {
			nearbyStations: true,
			photos: true,
			reports: true,
			travelTimeToN7: true
		}
	});

	for (const photoInDb of appartment.photos) {
		const photo = photos.find((p) => path.basename(p.photo) === photoInDb.filename);
		if (!photo) continue;
		const photoOnDiskFilename = path.join(__dirname, 'old-data', photo?.photo);

		if (photo !== undefined && photo && existsSync(photoOnDiskFilename)) {
			const targetFilename = path.join(
				__dirname,
				'../public/photos/appartments',
				photoInDb.id + '.jpeg'
			);

			mkdirSync(path.dirname(targetFilename), { recursive: true });
			await sharp(photoOnDiskFilename)
				.resize({
					width: 1000,
					withoutEnlargement: true
				})
				.jpeg({
					quality: 80
				})
				.toFile(targetFilename);
		}
	}
}

async function importData(ghost: User, appartments: AppartmentOld[], photos: PhotoOld[]) {
	const users: Record<string, User> = {};
	const appartmentsByOwner = appartments.reduce((acc, appart) => {
		const key = fixEmailTypos(
			appart.contact_mail?.trim().toLocaleLowerCase() ||
				createGhostEmail(
					appart.contact_prenom,
					appart.contact_nom,
					appart.uuid_proprietaire
				)
		);
		if (!acc[key]) acc[key] = [];
		acc[key].push({
			...appart,
			newEmail: key
		});
		return acc;
	}, {} as Record<string, (AppartmentOld & { newEmail: string })[]>);

	// create users
	for (const apparts of nqdm(Object.values(appartmentsByOwner))) {
		// console.info(
		// 	`Creating user ${apparts[0].contact_prenom} ${apparts[0].contact_nom} (#${apparts[0].uuid_proprietaire})`
		// );
		const appart = apparts[0];
		const preventAllUppercase = (s: string) => {
			if (s.toUpperCase() === s) {
				return s
					.split(/[ -]/)
					.map((w) => (w?.[0] || '').toUpperCase() + w.slice(1).toLowerCase())
					.join(' ');
			}
			return s;
		};
		const user = await prisma.user.create({
			data: {
				email: appart.newEmail,
				firstName: preventAllUppercase(appart.contact_prenom.trim()),
				lastName: preventAllUppercase(appart.contact_nom.trim()),
				phone: (appart.contact_port || appart.contact_tel).trim(),
				...agencyFromEmail(appart.newEmail)
			}
		});
		if (user === null) throw new Error('User not found');
		users[user.id] = user;
		await appartment(ghost, appart, photos, user);
	}
	return users;
}

async function nukeDb() {
	const tablenames = await prisma.$queryRaw<Array<{ Tables_in_loca7: string }>>`show tables`;

	const tables = tablenames
		.map(({ Tables_in_loca7 }) => Tables_in_loca7)
		.filter((name) => !['_prisma_migrations', 'user', 'key', 'session'].includes(name))
		.map((name) => `\`${name}\``);

	await prisma.$executeRawUnsafe('set FOREIGN_KEY_CHECKS = 0;');
	for (const table of tables) {
		try {
			await prisma.$executeRawUnsafe(`truncate table ${table};`);
		} catch (error) {
			console.error({ error });
		}
	}
	await prisma.$executeRawUnsafe('set FOREIGN_KEY_CHECKS = 1;');

	await prisma.user.deleteMany({
		where: {
			admin: false
		}
	});

	await prisma.key.deleteMany({
		where: {
			user: {
				admin: false
			}
		}
	});

	for (const user of await prisma.user.findMany({ where: { admin: true } })) {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				firstName: user.name?.split(' ')[0],
				lastName: user.name?.split(' ').slice(1).join(' '),
				name: null
			}
		});
	}

	rmSync(path.join(__dirname, '../public/photos/appartments'), { recursive: true });
	mkdirSync(path.join(__dirname, '../public/photos/appartments'));
}

async function main() {
	// Delete all data
	await nukeDb();

	// Create ghost user
	const ghost = await prisma.user.create({
		data: {
			firstName: 'Ghost',
			email: 'ghost@loca7.fr',
			phone: ''
		}
	});

	// Get old data
	const appartments = oldLogements.find((e) => e.type === 'table')?.data;
	const photos = oldPhotos.find((e) => e.type === 'table')?.data;

	// Create users
	const users = await importData(ghost, appartments, photos);
	console.info(
		`Created ${Object.keys(users).length} users, ${appartments.length} appartments, and ${
			photos.length
		} photos`
	);
	writeFileSync('created-users.json', JSON.stringify(users, null, 2));
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
