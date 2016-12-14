const html = require('choo/html')

module.exports = (field) => {
  const slug = slugify(field.name)
  switch (field.field_type) {
    // case paragraph, option, etc.
    default:
      return html`
        <p class="control">
          <label for=${slug} class="label">
            ${field.label || field.name}
          </label>
          <input
            type="${field.field_type}"
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
