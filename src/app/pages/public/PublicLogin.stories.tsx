/**
 * BIUST Smart Maintenance System - Public Login Page Story
 *
 * This Storybook file renders the PublicLogin component safely inside a Router context.
 * It preserves all functionality and comments from the original component.
 *
 * Purpose:
 * - Allow developers to preview the three-step login flow (Block → Room → Digital Key)
 * - Prevent "useNavigate()" errors by wrapping the component in a Router
 */

import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PublicLogin from './PublicLogin.js';

const withRouter: Decorator = (Story) => (
  <MemoryRouter initialEntries={['/']}>
    <Story />
  </MemoryRouter>
);

const meta = {
  title: 'Public/Resident Login',
  component: PublicLogin,
  decorators: [withRouter],
} satisfies Meta<typeof PublicLogin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};