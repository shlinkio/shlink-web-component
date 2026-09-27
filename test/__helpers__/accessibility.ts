import axe from 'axe-core';
import type { UserEvent } from 'vitest/browser';

type ContainerWrapper = { container: HTMLElement };

type AccessibilityTestSubject = ContainerWrapper | Promise<ContainerWrapper>;

/**
 * Verifies there are no accessibility violations in provided subject
 */
export const checkAccessibility = async (subject: AccessibilityTestSubject) => {
  const { container } = await subject;
  const { violations } = await axe.run(container);

  expect(violations).toStrictEqual([]);
};

type ContainerWrapperWithUser = ContainerWrapper & { user: UserEvent };

type UnhoveredAccessibilityTestSubject = ContainerWrapperWithUser | Promise<ContainerWrapperWithUser>;

/**
 * Verifies there are no accessibility violations in provided subject, making sure the hover state is reset beforehand.
 * This avoids false negatives due to different hover colors in some components.
 */
export const checkAccessibilityWithUnhover = async (subject: UnhoveredAccessibilityTestSubject) => {
  const { container, user } = await subject;

  await user.unhover(document.body);
  await checkAccessibility({ container });
};
