import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { de_DE, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { ArrowRightOutline, FullscreenOutline, FullscreenExitOutline, DownSquareOutline } from '@ant-design/icons-angular/icons';

import { provideNzIcons } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';

const icons: IconDefinition[] = [
  ArrowRightOutline,
  FullscreenOutline,
  FullscreenExitOutline,
  DownSquareOutline
];


registerLocaleData(de);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideNzI18n(de_DE), importProvidersFrom(FormsModule), provideAnimationsAsync(), provideHttpClient(), provideNzIcons(icons)]
};
