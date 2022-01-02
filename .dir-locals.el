((nil . (
         (eval . (defun set-hugo-section()
                   (setq org-hugo-section
                         (string-trim-left (spacemacs--projectile-directory-path) "content"))
                   ))
         (eval . (setq org-hugo-base-dir blog-dir))
         (eval . (add-hook 'after-save-hook #'set-hugo-section))
		     )))
