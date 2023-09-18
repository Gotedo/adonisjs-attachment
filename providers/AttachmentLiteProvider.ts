/*
 * @gotedo/adonisjs-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi@gotedo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AttachmentLiteProvider {
  constructor(protected application: ApplicationContract) {}

  public register() {
    this.application.container.bind('Gotedo/Adonis/AttachmentLite', () => {
      const { Attachment } = require('../src/Attachment')
      const { attachment } = require('../src/Attachment/decorator')

      return {
        Attachment: Attachment,
        attachment: attachment,
      }
    })
  }

  public boot() {
    this.application.container.withBindings(
      ['Gotedo/Adonis/AttachmentLite', 'Adonis/Core/Drive'],
      (AttachmentLite, Drive) => {
        AttachmentLite.Attachment.setDrive(Drive)
      }
    )
  }
}
