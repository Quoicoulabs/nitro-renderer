import { CLEAR_MODES } from '@pixi/constants';
import { Filter, FilterSystem, RenderTexture } from '@pixi/core';

export class FXAAFilter extends Filter
{
    private _resolution: number;

    constructor(resolution: number = 1.0)
    {
        const vertexShader = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;

            uniform mat3 projectionMatrix;

            varying vec2 vTextureCoord;

            void main(void)
            {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }`;

        const fragmentShader = `
            precision mediump float;
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform vec2 resolution;

            #define FXAA_REDUCE_MIN (1.0/128.0)
            #define FXAA_REDUCE_MUL (1.0/8.0)
            #define FXAA_SPAN_MAX 8.0

            void main() {
                vec2 inverseVP = 1.0 / resolution;
                vec3 rgbNW = texture2D(uSampler, vTextureCoord + vec2(-1.0, -1.0) * inverseVP).xyz;
                vec3 rgbNE = texture2D(uSampler, vTextureCoord + vec2(1.0, -1.0) * inverseVP).xyz;
                vec3 rgbSW = texture2D(uSampler, vTextureCoord + vec2(-1.0, 1.0) * inverseVP).xyz;
                vec3 rgbSE = texture2D(uSampler, vTextureCoord + vec2(1.0, 1.0) * inverseVP).xyz;
                vec3 rgbM = texture2D(uSampler, vTextureCoord).xyz;

                vec3 luma = vec3(0.299, 0.587, 0.114);
                float lumaNW = dot(rgbNW, luma);
                float lumaNE = dot(rgbNE, luma);
                float lumaSW = dot(rgbSW, luma);
                float lumaSE = dot(rgbSE, luma);
                float lumaM = dot(rgbM, luma);

                float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
                float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

                vec2 dir;
                dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
                dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));

                float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
                float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);

                dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * inverseVP;

                vec3 rgbA = 0.5 * (
                    texture2D(uSampler, vTextureCoord + dir * (1.0/3.0 - 0.5)).xyz +
                    texture2D(uSampler, vTextureCoord + dir * (2.0/3.0 - 0.5)).xyz);

                vec3 rgbB = rgbA * 0.5 + 0.25 * (
                    texture2D(uSampler, vTextureCoord + dir * (0.0/3.0 - 0.5)).xyz +
                    texture2D(uSampler, vTextureCoord + dir * (3.0/3.0 - 0.5)).xyz);

                float lumaB = dot(rgbB, luma);

                if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
                    gl_FragColor = vec4(rgbA, texture2D(uSampler, vTextureCoord).a);
                } else {
                    gl_FragColor = vec4(rgbB, texture2D(uSampler, vTextureCoord).a);
                }
            }`;

        super(vertexShader, fragmentShader);
        this._resolution = resolution;
    }

    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clear: CLEAR_MODES): void
    {
        this.uniforms.resolution = [input.width * this._resolution, input.height * this._resolution];
        filterManager.applyFilter(this, input, output, clear);
    }

    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(value: number)
    {
        this._resolution = value;
    }
}