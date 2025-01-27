/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import type { FC } from 'react';
import React from 'react';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiPageTemplate,
  EuiHorizontalRule,
  EuiFilePicker,
  EuiLoadingSpinner,
  EuiTitle,
} from '@elastic/eui';

import { WelcomeContent } from './welcome_content';

interface Props {
  onFilePickerChange(files: FileList | null): void;
  hasPermissionToImport: boolean;
}

export const AboutPanel: FC<Props> = ({ onFilePickerChange, hasPermissionToImport }) => {
  return (
    <EuiPageTemplate.Section alignment="center" data-test-subj="dataVisualizerPageFileUpload">
      <EuiFlexGroup gutterSize="xl">
        <EuiFlexItem grow={true}>
          <WelcomeContent hasPermissionToImport={hasPermissionToImport} />

          <EuiHorizontalRule margin="l" />

          <div css={{ textAlign: 'center' }}>
            <EuiFilePicker
              id="filePicker"
              initialPromptText={i18n.translate(
                'xpack.dataVisualizer.file.aboutPanel.selectOrDragAndDropFileDescription',
                {
                  defaultMessage: 'Select or drag and drop a file',
                }
              )}
              onChange={(files) => onFilePickerChange(files)}
              className="file-datavisualizer-file-picker"
            />
          </div>
          <EuiSpacer size="l" />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageTemplate.Section>
  );
};

export const LoadingPanel: FC = () => {
  return (
    <EuiPageTemplate.Section
      alignment="center"
      data-test-subj="dataVisualizerPageFileLoading"
      className="file-datavisualizer-about-panel__content"
    >
      <EuiPageTemplate.EmptyPrompt
        title={
          <EuiTitle size="s">
            <h1 role="alert">
              <FormattedMessage
                id="xpack.dataVisualizer.file.aboutPanel.analyzingDataTitle"
                defaultMessage="Analyzing data"
              />
            </h1>
          </EuiTitle>
        }
      >
        <EuiLoadingSpinner size="xl" />
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate.Section>
  );
};
