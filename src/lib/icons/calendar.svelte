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
	<rect x="7" y="18.8286" width="36" height="25.4571" stroke={color} stroke-width={strokeWidth} />
	<rect
		x="6.98929"
		y="8.86075"
		width="36.0214"
		height="4.97857"
		fill={color}
		stroke={color}
		stroke-width="4.97857"
	/>
	<path d="M12.1143 6.37146V2.85718" stroke={color} stroke-width={strokeWidth} />
	<path d="M37.8857 6.37146V2.85718" stroke={color} stroke-width={strokeWidth} />
</svg>
