/*global window, document, Ghost, $, _, Backbone */
(function () {
    "use strict";

    var Settings = {};

    // Base view
    // ----------
    Ghost.Views.Settings = Ghost.View.extend({
        initialize: function (options) {
            $(".settings-content").removeClass('active');
            this.addSubview(new Settings.Sidebar({
                el: '.settings-sidebar',
                pane: options.pane,
                model: this.model
            }));

            this.$('input').iCheck({
                checkboxClass: 'icheckbox_ghost'
            });
        }
    });

    // Sidebar (tabs)
    // ---------------
    Settings.Sidebar = Ghost.View.extend({
        initialize: function (options) {
            this.render();
            this.menu = this.$('.settings-menu');
            this.showContent(options.pane || 'general');
        },

        models: {},

        events: {
            'click .settings-menu li' : 'switchPane'
        },

        switchPane: function (e) {
            e.preventDefault();
            var item = $(e.currentTarget),
                id = item.find('a').attr('href').substring(1);
            this.showContent(id);
        },

        showContent: function (id) {
            var self = this,
                model;

            Backbone.history.navigate('/settings/' + id);
            if (this.pane && id === this.pane.el.id) {
                return;
            }
            _.result(this.pane, 'destroy');
            this.setActive(id);
            this.pane = new Settings[id]({ el: '.settings-content'});

            if (!this.models.hasOwnProperty(this.pane.options.modelType)) {
                model = this.models[this.pane.options.modelType] = new Ghost.Models[this.pane.options.modelType]();
                model.fetch().then(function () {
                    self.renderPane(model);
                });
            } else {
                model = this.models[this.pane.options.modelType];
                self.renderPane(model);
            }
        },

        renderPane: function (model) {
            this.pane.model = model;
            this.pane.render();
        },

        setActive: function (id) {
            this.menu.find('li').removeClass('active');
            this.menu.find('a[href=#' + id + ']').parent().addClass('active');
        },

        templateName: 'settings/sidebar'
    });

    // Content panes
    // --------------
    Settings.Pane = Ghost.View.extend({
        options: {
            modelType: 'Settings'
        },
        destroy: function () {
            this.$el.removeClass('active');
            this.undelegateEvents();
        },

        afterRender: function () {
            this.$el.attr('id', this.id);
            this.$el.addClass('active');
        },
        saveSuccess: function () {
            this.addSubview(new Ghost.Views.NotificationCollection({
                model: [{
                    type: 'success',
                    message: 'Saved',
                    status: 'passive'
                }]
            }));

        },
        saveError: function () {
            this.addSubview(new Ghost.Views.NotificationCollection({
                model: [{
                    type: 'error',
                    message: 'Something went wrong, not saved :(',
                    status: 'passive'
                }]
            }));
        }
    });

    // TODO: use some kind of data-binding for forms

    // ### General settings
    Settings.general = Settings.Pane.extend({
        id: "general",

        events: {
            'click .button-save': 'saveSettings'
        },

        saveSettings: function () {
            this.model.save({
                title: this.$('#blog-title').val(),
                email: this.$('#email-address').val()
            }, {
                success: this.saveSuccess,
                error: this.saveError
            });
        },

        templateName: 'settings/general',

        beforeRender: function () {
            var settings = this.model.toJSON();
            this.$('#blog-title').val(settings.title);
            this.$('#email-address').val(settings.email);
        }
    });

    // ### Content settings
    Settings.content = Settings.Pane.extend({
        id: 'content',
        events: {
            'click .button-save': 'saveSettings'
        },
        saveSettings: function () {
            this.model.save({
                description: this.$('#blog-description').val()
            }, {
                success: this.saveSuccess,
                error: this.saveError
            });
        },

        templateName: 'settings/content',

        beforeRender: function () {
            var settings = this.model.toJSON();
            this.$('#blog-description').val(settings.description);
        }
    });

     // ### User profile
    Settings.user = Settings.Pane.extend({
        id: 'user',

        options: {
            modelType: 'User'
        },

        events: {
            'click .button-save': 'saveUser'
        },

        saveUser: function () {
            this.model.save({
                'full_name':        this.$('#user-name').val(),
                'email_address':    this.$('#user-email').val(),
                'location':         this.$('#user-location').val(),
                'url':              this.$('#user-website').val(),
                'bio':              this.$('#user-bio').val(),
                'profile_picture':  this.$('#user-profile-picture').attr('src'),
                'cover_picture':    this.$('#user-cover-picture').attr('src')
            }, {
                success: this.saveSuccess,
                error: this.saveError
            });
        },

        templateName: 'settings/user-profile',

        beforeRender: function () {
            var user = this.model.toJSON();
            this.$('#user-name').val(user.full_name);
            this.$('#user-email').val(user.email_address);
            this.$('#user-location').val(user.location);
            this.$('#user-website').val(user.url);
            this.$('#user-bio').val(user.bio);
            this.$('#user-profile-picture').attr('src', user.profile_picture);
            this.$('#user-cover-picture').attr('src', user.cover_picture);
        }
    });

    // ### User settings
    Settings.users = Settings.Pane.extend({
        id: 'users',
        events: {
        }
    });

    // ### Appearance settings
    Settings.appearance = Settings.Pane.extend({
        id: 'appearance',
        events: {
        }
    });

    // ### Services settings
    Settings.services = Settings.Pane.extend({
        id: 'services',
        events: {
        }
    });

    // ### Plugins settings
    Settings.plugins = Settings.Pane.extend({
        id: 'plugins',
        events: {
        }
    });

}());
