<script lang="ts">
	export let color: string = 'currentColor';
	export let strokeWidth: number = 5;
	export let flip: boolean = false;
</script>

<svg
	style:transform={flip ? 'scaleX(-1)' : ''}
	width="50"
	height="50"
	viewBox="0 0 50 50"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<circle cx="8" cy="38" r="4" fill={color} />
	<path d="M45 38H15" stroke={color} stroke-width={strokeWidth} />
	<circle cx="8" cy="25" r="4" fill={color} />
	<path d="M45 25H15" stroke={color} stroke-width={strokeWidth} />
	<circle cx="8" cy="12" r="4" fill={color} />
	<path d="M45 12H15" stroke={color} stroke-width={strokeWidth} />
</svg>
