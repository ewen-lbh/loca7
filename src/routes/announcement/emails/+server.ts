import { guards } from '$lib/server/lucia';
import { isGhostEmail } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals, params }) => {
	const { user, session } = await locals.validateUser();
	guards.isAdmin(user, session, url);

	const users = (
		await prisma.user.findMany({
			where: {
				keys: {
					none: {
						id: {
							startsWith: 'email:'
						}
					}
				}
			}
		})
	).filter((user) => !isGhostEmail(user.email));

	return new Response(users.map((u) => u.email).join('\n'));
};
