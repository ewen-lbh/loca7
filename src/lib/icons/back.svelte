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
	<path
		d="M46.5 25H6.5M6.5 25L24.1812 7.5M6.5 25L24.1812 42.5"
		stroke={color}
		stroke-width={strokeWidth}
	/>
</svg>
