<?php

class extension_quill_for_symphony extends Extension
{
    public function getSubscribedDelegates()
    {
        return array(
            array(
                'page' => '/backend/',
                'delegate' => 'InitaliseAdminPageHead',
                'callback' => 'initaliseAdminPageHead'
            )
        );
    }

    public function initaliseAdminPageHead($context)
    {
        $page_callback = Administration::instance()->getPageCallback();
        $page_callback = $page_callback['context'];

        if (isset($page_callback['section_handle']) && ($page_callback['page'] == 'edit' || $page_callback['page'] == 'new')) {
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/quill_for_symphony/assets/lib/quill.min.js');
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/quill_for_symphony/assets/lib/markdown-it.min.js');
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/quill_for_symphony/assets/lib/turndown.min.js');
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/quill_for_symphony/assets/lib/quill-markdown-shortcuts.min.js');
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/quill_for_symphony/assets/publish.editor.js');
            Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/quill_for_symphony/assets/lib/quill.bubble.min.css');
            Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/quill_for_symphony/assets/publish.editor.css');
        }
    }
}
