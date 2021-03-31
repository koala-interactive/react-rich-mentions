/// <reference types="cypress" />

function getHtmlWithAttributesSorted(html: string): string {
  return html
    .replace(/\/?unicorn\.\w+\./, 'unicorn.')
    .replace(/<(\w+)([^>]+)>/g, ($0, $1, $2) => {
      const regex = /([a-zA-Z0-9_-]+)="([^"]+)?"/g;
      const attributes = [];
      let matches;

      while ((matches = regex.exec($2))) {
        attributes.push({ key: matches[1], value: matches[2] || '' });
      }

      attributes.sort((a, b) => (a.key > b.key ? 1 : a.key < b.key ? -1 : 0));
      const attributesHTML = attributes
        .map(attribute => `${attribute.key}="${attribute.value}"`)
        .join(' ');

      return `<${$1} ${attributesHTML}>`;
    });
}

context('config.customizeFragment', () => {
  it('Should set html value correctly', () => {
    cy.visit(Cypress.env('baseUrl'));
    cy.get('[data-cy=set-value]').click();
    cy.get('[data-cy=input]').then(elem => {
      expect(getHtmlWithAttributesSorted(elem.html())).equal(
        '<span class="emojione" data-integrity="😉" data-rich-mentions=":smile:" style="font-size: 19px; line-height: 19px;">😉</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="emojione" data-integrity="😉" data-rich-mentions=":smile:" style="font-size: 19px; line-height: 19px;">😉</span>&nbsp;<img class="emojione vaM" data-integrity="" data-rich-mentions=":smile:" height="19" src="unicorn.png" width="19">'
      );
    });

    /* Problem with Cypress using Firefox. type() doesn't add the text at the contenteditable end. Working as intented as user.
    cy.get('[data-cy=input]').type('_');
    cy.get('[data-cy=input]').then(elem => {
      expect(getHtmlWithAttributesSorted(elem.html())).equal(
        '<span class="emojione" data-integrity="😉" data-rich-mentions=":smile:" style="font-size: 19px; line-height: 19px;">😉</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="emojione" data-integrity="😉" data-rich-mentions=":smile:" style="font-size: 19px; line-height: 19px;">😉</span>&nbsp;<img class="emojione vaM" data-integrity="" data-rich-mentions=":smile:" height="19" src="unicorn.png" width="19">_'
      );
    });
    */
  });
});
