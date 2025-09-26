import { CLEAR_MODES } from '@pixi/constants';
import { Filter, FilterSystem, RenderTexture } from '@pixi/core';

export class SharpenFilter extends Filter
{
    private _strength: number;

    constructor(strength: number = 1.0)
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
            uniform vec2 texelSize;
            uniform float strength;

            void main() {
                vec4 center = texture2D(uSampler, vTextureCoord);

                // Sample surrounding pixels
                vec4 top = texture2D(uSampler, vTextureCoord + vec2(0.0, -texelSize.y));
                vec4 bottom = texture2D(uSampler, vTextureCoord + vec2(0.0, texelSize.y));
                vec4 left = texture2D(uSampler, vTextureCoord + vec2(-texelSize.x, 0.0));
                vec4 right = texture2D(uSampler, vTextureCoord + vec2(texelSize.x, 0.0));

                // Sharpen kernel: center pixel enhanced, surrounding pixels subtracted
                vec4 sharpened = center * (1.0 + 4.0 * strength) - (top + bottom + left + right) * strength;

                // Preserve original alpha and clamp values
                gl_FragColor = vec4(clamp(sharpened.rgb, 0.0, 1.0), center.a);
            }`;

        super(vertexShader, fragmentShader);
        this._strength = strength;
    }

    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clear: CLEAR_MODES): void
    {
        this.uniforms.texelSize = [1.0 / input.width, 1.0 / input.height];
        this.uniforms.strength = this._strength;
        filterManager.applyFilter(this, input, output, clear);
    }

    get strength(): number
    {
        return this._strength;
    }

    set strength(value: number)
    {
        this._strength = Math.max(0, Math.min(2, value)); // Clamp between 0 and 2
    }
}