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
	<g clip-path="url(#clip0_1_329)">
		<path
			d="M24.3571 46.5C15.3572 37.5 11.5 28.8214 11.5 18.5357C11.5 13.7143 15.0357 3.75 24.3571 3.75C31.75 3.75 38.5 7.28572 38.5 18.5357C38.5 32.9357 29.1786 41.6785 24.3571 46.5Z"
			stroke={color}
			stroke-width={strokeWidth}
		/>
		<circle cx="25.3215" cy="18.2142" r="4.5" fill={color} />
	</g>
	<defs>
		<clipPath id="clip0_1_329">
			<rect width="50" height="50" fill="white" />
		</clipPath>
	</defs>
</svg>
