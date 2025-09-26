import { CLEAR_MODES } from '@pixi/constants';
import { Filter, FilterSystem, RenderTexture } from '@pixi/core';

export class ToneMappingFilter extends Filter
{
    private _exposure: number;
    private _gamma: number;
    private _whitePoint: number;

    constructor(exposure: number = 1.0, gamma: number = 2.2, whitePoint: number = 1.0)
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
            uniform float exposure;
            uniform float gamma;
            uniform float whitePoint;

            // Reinhard tone mapping operator
            vec3 reinhardToneMapping(vec3 color, float whitePoint) {
                return color * (1.0 + color / (whitePoint * whitePoint)) / (1.0 + color);
            }

            // ACES tone mapping (Academy Color Encoding System)
            vec3 acesToneMapping(vec3 color) {
                const float a = 2.51;
                const float b = 0.03;
                const float c = 2.43;
                const float d = 0.59;
                const float e = 0.14;
                return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
            }

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);

                // Apply exposure
                vec3 exposed = color.rgb * exposure;

                // Apply tone mapping (using ACES for better color preservation)
                vec3 toneMapped = acesToneMapping(exposed);

                // Apply gamma correction
                vec3 gammaCorrected = pow(toneMapped, vec3(1.0 / gamma));

                gl_FragColor = vec4(gammaCorrected, color.a);
            }`;

        super(vertexShader, fragmentShader);
        this._exposure = exposure;
        this._gamma = gamma;
        this._whitePoint = whitePoint;
    }

    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clear: CLEAR_MODES): void
    {
        this.uniforms.exposure = this._exposure;
        this.uniforms.gamma = this._gamma;
        this.uniforms.whitePoint = this._whitePoint;
        filterManager.applyFilter(this, input, output, clear);
    }

    get exposure(): number
    {
        return this._exposure;
    }

    set exposure(value: number)
    {
        this._exposure = Math.max(0.1, Math.min(4.0, value));
    }

    get gamma(): number
    {
        return this._gamma;
    }

    set gamma(value: number)
    {
        this._gamma = Math.max(0.5, Math.min(4.0, value));
    }

    get whitePoint(): number
    {
        return this._whitePoint;
    }

    set whitePoint(value: number)
    {
        this._whitePoint = Math.max(0.1, Math.min(10.0, value));
    }
}