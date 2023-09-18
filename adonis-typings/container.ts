/*
 * @gotedo/adonisjs-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi@gotedo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import AttachmentLite from '@ioc:Gotedo/Adonis/AttachmentLite'

  interface ContainerBindings {
    'Gotedo/Adonis/AttachmentLite': typeof AttachmentLite
  }
}
