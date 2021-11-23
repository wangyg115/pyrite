<!-- eslint-disable vue/attribute-hyphenation -->
<template>
    <path
        id="path1883"
        class="shard dark"
        d="m 5.4804785,14.410944 a 7.1183372,7.1183372 0 0 0 5.2827995,4.444952 l 2.565838,-4.444952 z"
    />
    <path
        id="path1881"
        class="shard primary"
        d="m 15.191999,12.207584 -3.886627,6.73271 a 7.1183372,7.1183372 0 0 0 0.824501,0.04797 7.1183372,7.1183372 0 0 0 5.486219,-2.58279 z"
    />
    <path
        id="path1879"
        class="shard dark"
        d="M 14.215653,9.4927872 17.952241,15.96509 A 7.1183372,7.1183372 0 0 0 19.248144,11.869992 7.1183372,7.1183372 0 0 0 18.839139,9.4927872 Z"
    />
    <path
        id="path1877"
        class="shard primary"
        d="m 6.6768355,7.2944764 a 7.1183372,7.1183372 0 0 0 -1.665233,4.5755156 7.1183372,7.1183372 0 0 0 0.295753,2.029876 h 5.1825315 z"
    />
    <path
        id="path1875"
        class="shard primary"
        d="m 13.714316,4.9306159 -2.338973,4.0510954 h 7.260376 A 7.1183372,7.1183372 0 0 0 13.714316,4.9306159 Z"
    />
    <path
        id="path1841"
        class="shard dark"
        d="M 12.129873,4.7517214 A 7.1183372,7.1183372 0 0 0 7.0378715,6.8962918 L 9.5131795,11.18435 13.181961,4.8299879 a 7.1183372,7.1183372 0 0 0 -1.052088,-0.078266 z"
    />
    <circle
        id="circle1843"
        class="pupil primary"
        cx="12.129838"
        cy="11.870106"
        r="1.5759634"
    />
</template>

<style lang="scss">
@keyframes light-1 {

    0%,
    85% {
        fill: var(--grey-4);
        opacity: 0;
    }

    100% {
        fill: var(--primary-color);
        opacity: 1;
    }
}

@keyframes light-2 {

    0%,
    65% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes blink {

    0% {
        fill: transparent;
        opacity: 0.2;
    }

    50% {fill: var(--grey-3);}
    52% {fill: var(--primary-color);}
    60% {fill: var(--grey-3);}
    65% {fill: var(--primary-color);}
    70% {fill: var(--grey-3);}
    75% {fill: var(--primary-color);}

    80% {
        fill: var(--grey-3);
        opacity: 0.2;
    }
    83% {fill: var(--primary-color);}
    85% {fill: var(--grey-3);}
    87% {fill: var(--primary-color);}

    100% {
        fill: var(--primary-color);
        opacity: 1;
    }
}

.dark {
    fill: var(--grey-3);
}

.primary {
    fill: var(--primary-color);
}

.logo-animated {

    .shard.primary {
        animation: 1.75s ease-in-out running light-1;
    }

    .shard.dark {
        animation: 1.5s ease running light-2;
    }

    .pupil {
        animation: 1.5s ease-in-out running blink;
    }
}
</style>
