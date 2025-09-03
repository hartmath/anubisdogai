/**
 * @fileOverview Creates and configures a new Genkit instance.
 *
 * This file is the single source of truth for the Genkit dependency.
 * By using this file, you can easily swap out the model provider for all flows.
 */
'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
});
