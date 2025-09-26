import { Application } from '@pixi/app';
import { Filter } from '@pixi/core';
import { Container } from '@pixi/display';
import { AdjustmentFilter } from './adjustment-filter/AdjustmentFilter';
import { FXAAFilter } from './FXAAFilter';
import { SharpenFilter } from './SharpenFilter';
import { ToneMappingFilter } from './ToneMappingFilter';

export interface PostProcessingSettings
{
    enableFXAA?: boolean;
    enableSharpening?: boolean;
    enableToneMapping?: boolean;
    enableColorAdjustments?: boolean;
    fxaaResolution?: number;
    sharpenStrength?: number;
    exposure?: number;
    gamma?: number;
    whitePoint?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
}

export class PostProcessingManager
{
    private _application: Application;
    private _targetContainer: Container;
    private _filters: Filter[];
    private _settings: PostProcessingSettings;

    private _fxaaFilter: FXAAFilter;
    private _sharpenFilter: SharpenFilter;
    private _toneMappingFilter: ToneMappingFilter;
    private _adjustmentFilter: AdjustmentFilter;

    constructor(application: Application, targetContainer: Container)
    {
        this._application = application;
        this._targetContainer = targetContainer;
        this._filters = [];
        this._settings = {
            enableFXAA: true,
            enableSharpening: false,
            enableToneMapping: false,
            enableColorAdjustments: false,
            fxaaResolution: 1.0,
            sharpenStrength: 0.5,
            exposure: 1.0,
            gamma: 2.2,
            whitePoint: 1.0,
            brightness: 1.0,
            contrast: 1.0,
            saturation: 1.0
        };

        this.initializeFilters();
        this.updateFilters();
    }

    private initializeFilters(): void
    {
        this._fxaaFilter = new FXAAFilter(this._settings.fxaaResolution);
        this._sharpenFilter = new SharpenFilter(this._settings.sharpenStrength);
        this._toneMappingFilter = new ToneMappingFilter(
            this._settings.exposure,
            this._settings.gamma,
            this._settings.whitePoint
        );
        this._adjustmentFilter = new AdjustmentFilter({
            brightness: this._settings.brightness,
            contrast: this._settings.contrast,
            saturation: this._settings.saturation
        });
    }

    private updateFilters(): void
    {
        this._filters = [];

        // Order matters for post-processing pipeline
        // 1. Color adjustments (brightness, contrast, saturation)
        if(this._settings.enableColorAdjustments)
        {
            this._filters.push(this._adjustmentFilter);
        }

        // 2. Tone mapping (exposure, gamma correction)
        if(this._settings.enableToneMapping)
        {
            this._filters.push(this._toneMappingFilter);
        }

        // 3. Sharpening (detail enhancement)
        if(this._settings.enableSharpening)
        {
            this._filters.push(this._sharpenFilter);
        }

        // 4. FXAA (anti-aliasing) - should be last for best results
        if(this._settings.enableFXAA)
        {
            this._filters.push(this._fxaaFilter);
        }

        // Apply filters to target container
        this._targetContainer.filters = this._filters.length > 0 ? this._filters : null;
    }

    public updateSettings(newSettings: Partial<PostProcessingSettings>): void
    {
        this._settings = { ...this._settings, ...newSettings };

        // Update individual filter properties
        if(this._fxaaFilter && newSettings.fxaaResolution !== undefined)
        {
            this._fxaaFilter.resolution = newSettings.fxaaResolution;
        }

        if(this._sharpenFilter && newSettings.sharpenStrength !== undefined)
        {
            this._sharpenFilter.strength = newSettings.sharpenStrength;
        }

        if(this._toneMappingFilter)
        {
            if(newSettings.exposure !== undefined) this._toneMappingFilter.exposure = newSettings.exposure;
            if(newSettings.gamma !== undefined) this._toneMappingFilter.gamma = newSettings.gamma;
            if(newSettings.whitePoint !== undefined) this._toneMappingFilter.whitePoint = newSettings.whitePoint;
        }

        if(this._adjustmentFilter)
        {
            if(newSettings.brightness !== undefined) this._adjustmentFilter.brightness = newSettings.brightness;
            if(newSettings.contrast !== undefined) this._adjustmentFilter.contrast = newSettings.contrast;
            if(newSettings.saturation !== undefined) this._adjustmentFilter.saturation = newSettings.saturation;
        }

        this.updateFilters();
    }

    public getSettings(): PostProcessingSettings
    {
        return { ...this._settings };
    }

    public enablePreset(preset: 'performance' | 'quality' | 'cinematic' | 'pixelArt'): void
    {
        switch(preset)
        {
            case 'performance':
                this.updateSettings({
                    enableFXAA: false,
                    enableSharpening: false,
                    enableToneMapping: false,
                    enableColorAdjustments: false
                });
                break;

            case 'quality':
                this.updateSettings({
                    enableFXAA: true,
                    enableSharpening: true,
                    enableToneMapping: false,
                    enableColorAdjustments: false,
                    fxaaResolution: 1.0,
                    sharpenStrength: 0.3
                });
                break;

            case 'cinematic':
                this.updateSettings({
                    enableFXAA: true,
                    enableSharpening: false,
                    enableToneMapping: true,
                    enableColorAdjustments: true,
                    fxaaResolution: 1.0,
                    exposure: 1.2,
                    gamma: 2.2,
                    contrast: 1.1,
                    saturation: 1.1
                });
                break;

            case 'pixelArt':
                this.updateSettings({
                    enableFXAA: false,
                    enableSharpening: true,
                    enableToneMapping: false,
                    enableColorAdjustments: true,
                    sharpenStrength: 0.8,
                    contrast: 1.2,
                    saturation: 1.1
                });
                break;
        }
    }

    public dispose(): void
    {
        if(this._targetContainer)
        {
            this._targetContainer.filters = null;
        }

        this._fxaaFilter?.destroy();
        this._sharpenFilter?.destroy();
        this._toneMappingFilter?.destroy();
        this._adjustmentFilter?.destroy();

        this._filters = [];
    }
}