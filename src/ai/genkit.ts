/**
 * @fileOverview Creates and new Genkit instance and exports important functions.
 *
 * This file is the single source of truth for the Genkit dependency.
 * By using this file, you can easily swap out the model provider for all flows.
 */

import {genkit} from 'genkit';
import {generate} from '@genkit-ai/ai';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
});

export {generate};
