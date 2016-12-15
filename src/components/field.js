const html = require('choo/html')

module.exports = (field) => {
  const slug = slugify(field.name)
  switch (field.type) {
    case 'radio':
      return html`
        <p class="control">
          <label for=${slug} class="label">
            ${field.label || field.name}
          </label>
          ${field.options.map((opt) => html`
            <p>
              <label class=${field.type}>
                <input
                  type=${field.type}
                  name=${slug}
                  value=${opt.label}
                  ${field.required ? 'required' : ''}
                  ${field.value === opt.label ? 'checked' : ''}
                />
                ${opt.label}
              </label>
            </p>
          `)}
          ${field.description ? html`<p class="help">${field.description}</p>` : ''}
        </p>
      `
    default:
      return html`
        <p class="control">
          <label for=${slug} class="label">
            ${field.label || field.name}
          </label>
          <input
            type="${field.type}"
            name=${slug}
            id=${slug}
            class="input"
            value=${field.value}
            ${field.required ? 'required' : ''} 
          />
          ${field.description ? html`<p class="help">${field.description}</p>` : ''}
        </p>
      `
  }
}

function slugify (text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^a-zA-Z0-9]/g, '_')  // Replace non-alphanumeric chars with _
    .replace(/__+/g, '_')           // Replace multiple _ with single _
    .replace(/^_|_$/i, '')          // Remove leading/trailing _
}
